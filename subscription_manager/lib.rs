#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod subscription_manager {
    use ink::storage::Mapping;

    #[derive(Debug, PartialEq, Eq, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Tier {
        pub tier_id: u32,
        pub name: String,
        pub price: Balance,
        pub benefits: Vec<String>,
        pub creator: AccountId,
    }

    #[derive(Debug, PartialEq, Eq, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct SubscriptionRecord {
        pub subscriber: AccountId,
        pub creator: AccountId,
        pub tier_id: u32,
        pub expiration: Timestamp,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// The creator is not registered.
        CreatorNotRegistered,
        /// The payment amount is incorrect.
        InvalidPaymentAmount,
        /// Transfer failed.
        TransferFailed,
        /// Subscription has expired.
        SubscriptionExpired,
        /// Tier not found.
        TierNotFound,
        /// Unauthorized action.
        Unauthorized,
        /// Invalid tier data.
        InvalidTierData,
    }

    #[ink(storage)]
    pub struct SubscriptionManager {
        /// Mapping from (Subscriber, Creator) -> Subscription Record
        subscriptions: Mapping<(AccountId, AccountId), SubscriptionRecord>,
        /// Mapping from Creator -> Monthly Price (legacy, kept for backward compatibility)
        creator_prices: Mapping<AccountId, Balance>,
        /// Mapping from (Creator, TierId) -> Tier
        tiers: Mapping<(AccountId, u32), Tier>,
        /// Mapping from Creator -> Next Tier ID
        next_tier_id: Mapping<AccountId, u32>,
        /// Treasury account for platform fees
        treasury: AccountId,
        /// Admin account
        admin: AccountId,
    }

    impl SubscriptionManager {
        #[ink(constructor)]
        pub fn new(treasury: AccountId) -> Self {
            Self {
                subscriptions: Mapping::default(),
                creator_prices: Mapping::default(),
                tiers: Mapping::default(),
                next_tier_id: Mapping::default(),
                treasury,
                admin: Self::env().caller(),
            }
        }

        /// Register as a creator and set the monthly subscription price.
        #[ink(message)]
        pub fn register_creator(&mut self, price: Balance) -> Result<(), Error> {
            let caller = Self::env().caller();
            self.creator_prices.insert(caller, &price);
            Ok(())
        }

        /// Subscribe to a creator for 30 days (legacy function for backward compatibility).
        #[ink(message, payable)]
        pub fn subscribe(&mut self, creator: AccountId) -> Result<(), Error> {
            let caller = self.env().caller();
            let payment = self.env().transferred_value();
            let price = self.creator_prices.get(creator).ok_or(Error::CreatorNotRegistered)?;

            if payment != price {
                return Err(Error::InvalidPaymentAmount);
            }

            // Calculate fee (3%)
            let fee = payment.checked_mul(3).unwrap().checked_div(100).unwrap();
            let creator_share = payment.checked_sub(fee).unwrap();

            // Transfer shares
            if fee > 0 {
                self.env().transfer(self.treasury, fee).map_err(|_| Error::TransferFailed)?;
            }
            if creator_share > 0 {
                self.env().transfer(creator, creator_share).map_err(|_| Error::TransferFailed)?;
            }

            // Update subscription
            let current_time = self.env().block_timestamp();
            let existing_record = self.subscriptions.get((caller, creator));
            
            // If expired or new, start from now. If active, extend from current expiration.
            let start_time = if let Some(record) = existing_record {
                if record.expiration > current_time {
                    record.expiration
                } else {
                    current_time
                }
            } else {
                current_time
            };

            // Add 30 days (in milliseconds)
            // 30 * 24 * 60 * 60 * 1000 = 2,592,000,000
            let new_expiration = start_time + 2_592_000_000;
            
            let subscription_record = SubscriptionRecord {
                subscriber: caller,
                creator,
                tier_id: 0, // Default tier 0 for legacy subscriptions
                expiration: new_expiration,
            };

            self.subscriptions.insert((caller, creator), &subscription_record);

            Ok(())
        }

        /// Check if a user has an active subscription to a creator.
        #[ink(message)]
        pub fn check_subscription(&self, user: AccountId, creator: AccountId) -> bool {
            if let Some(record) = self.subscriptions.get((user, creator)) {
                let current_time = self.env().block_timestamp();
                record.expiration > current_time
            } else {
                false
            }
        }

        /// Get the subscription price for a creator.
        #[ink(message)]
        pub fn get_creator_price(&self, creator: AccountId) -> Option<Balance> {
            self.creator_prices.get(creator)
        }
        
        /// Get the expiration timestamp for a subscription.
        #[ink(message)]
        pub fn get_subscription_expiration(&self, user: AccountId, creator: AccountId) -> Timestamp {
            if let Some(record) = self.subscriptions.get((user, creator)) {
                record.expiration
            } else {
                0
            }
        }

        // ===== NEW MULTI-TIER SUBSCRIPTION FUNCTIONS =====

        /// Create a new subscription tier as a creator.
        #[ink(message)]
        pub fn create_tier(&mut self, name: String, price: Balance, benefits: Vec<String>) -> Result<u32, Error> {
            let caller = self.env().caller();
            
            if name.is_empty() || price == 0 {
                return Err(Error::InvalidTierData);
            }

            // Get next tier ID for this creator
            let tier_id = self.next_tier_id.get(caller).unwrap_or(1);
            
            let tier = Tier {
                tier_id,
                name,
                price,
                benefits,
                creator: caller,
            };

            self.tiers.insert((caller, tier_id), &tier);
            self.next_tier_id.insert(caller, &(tier_id + 1));

            Ok(tier_id)
        }

        /// Subscribe to a specific tier of a creator.
        #[ink(message, payable)]
        pub fn subscribe_to_tier(&mut self, creator: AccountId, tier_id: u32) -> Result<(), Error> {
            let caller = self.env().caller();
            let payment = self.env().transferred_value();
            
            // Get tier
            let tier = self.tiers.get((creator, tier_id)).ok_or(Error::TierNotFound)?;
            
            if payment != tier.price {
                return Err(Error::InvalidPaymentAmount);
            }

            // Calculate fee (3%)
            let fee = payment.checked_mul(3).unwrap().checked_div(100).unwrap();
            let creator_share = payment.checked_sub(fee).unwrap();

            // Transfer shares
            if fee > 0 {
                self.env().transfer(self.treasury, fee).map_err(|_| Error::TransferFailed)?;
            }
            if creator_share > 0 {
                self.env().transfer(creator, creator_share).map_err(|_| Error::TransferFailed)?;
            }

            // Update subscription
            let current_time = self.env().block_timestamp();
            let existing_record = self.subscriptions.get((caller, creator));
            
            // If expired or new, start from now. If active, extend from current expiration.
            let start_time = if let Some(record) = existing_record {
                if record.expiration > current_time {
                    record.expiration
                } else {
                    current_time
                }
            } else {
                current_time
            };

            // Add 30 days (in milliseconds)
            let new_expiration = start_time + 2_592_000_000;
            
            let subscription_record = SubscriptionRecord {
                subscriber: caller,
                creator,
                tier_id,
                expiration: new_expiration,
            };

            self.subscriptions.insert((caller, creator), &subscription_record);

            Ok(())
        }

        /// Get all tiers for a creator (returns up to 10 tiers).
        #[ink(message)]
        pub fn get_creator_tiers(&self, creator: AccountId) -> Vec<Tier> {
            let mut tiers = Vec::new();
            let max_tier_id = self.next_tier_id.get(creator).unwrap_or(1);
            
            for tier_id in 1..max_tier_id {
                if let Some(tier) = self.tiers.get((creator, tier_id)) {
                    tiers.push(tier);
                }
                if tiers.len() >= 10 {
                    break;
                }
            }
            
            tiers
        }

        /// Get the tier ID that a subscriber is currently subscribed to.
        #[ink(message)]
        pub fn get_subscriber_tier(&self, user: AccountId, creator: AccountId) -> Option<u32> {
            if let Some(record) = self.subscriptions.get((user, creator)) {
                let current_time = self.env().block_timestamp();
                if record.expiration > current_time {
                    return Some(record.tier_id);
                }
            }
            None
        }

        /// Check if a user has access to a specific tier level.
        #[ink(message)]
        pub fn check_tier_access(&self, user: AccountId, creator: AccountId, required_tier_id: u32) -> bool {
            if let Some(record) = self.subscriptions.get((user, creator)) {
                let current_time = self.env().block_timestamp();
                if record.expiration > current_time {
                    // User has access if their tier_id is >= required_tier_id
                    return record.tier_id >= required_tier_id;
                }
            }
            false
        }

        /// Update an existing tier (only by the creator who owns it).
        #[ink(message)]
        pub fn update_tier(&mut self, tier_id: u32, new_price: Balance, new_benefits: Vec<String>) -> Result<(), Error> {
            let caller = self.env().caller();
            
            let mut tier = self.tiers.get((caller, tier_id)).ok_or(Error::TierNotFound)?;
            
            if tier.creator != caller {
                return Err(Error::Unauthorized);
            }
            
            if new_price == 0 {
                return Err(Error::InvalidTierData);
            }

            tier.price = new_price;
            tier.benefits = new_benefits;
            
            self.tiers.insert((caller, tier_id), &tier);

            Ok(())
        }

        /// Delete a tier (only by the creator who owns it).
        #[ink(message)]
        pub fn delete_tier(&mut self, tier_id: u32) -> Result<(), Error> {
            let caller = self.env().caller();
            
            let tier = self.tiers.get((caller, tier_id)).ok_or(Error::TierNotFound)?;
            
            if tier.creator != caller {
                return Err(Error::Unauthorized);
            }

            self.tiers.remove((caller, tier_id));

            Ok(())
        }

        /// Get a specific tier by creator and tier ID.
        #[ink(message)]
        pub fn get_tier(&self, creator: AccountId, tier_id: u32) -> Option<Tier> {
            self.tiers.get((creator, tier_id))
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn registration_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = SubscriptionManager::new(accounts.alice);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            assert_eq!(contract.register_creator(100), Ok(()));
            assert_eq!(contract.get_creator_price(accounts.bob), Some(100));
        }

        #[ink::test]
        fn subscription_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = SubscriptionManager::new(accounts.alice); // Alice is treasury

            // Bob registers
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            contract.register_creator(100).unwrap();

            // Charlie subscribes
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(accounts.charlie, 10_000_000);
            
            // Pay 100
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            contract.subscribe(accounts.bob).unwrap();

            // Check subscription
            assert!(contract.check_subscription(accounts.charlie, accounts.bob));
        }

        #[ink::test]
        fn tier_creation_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = SubscriptionManager::new(accounts.alice);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            
            let benefits = vec!["Access to exclusive content".to_string()];
            let tier_id = contract.create_tier("Bronze".to_string(), 100, benefits).unwrap();
            
            assert_eq!(tier_id, 1);
            
            let tier = contract.get_tier(accounts.bob, tier_id).unwrap();
            assert_eq!(tier.name, "Bronze");
            assert_eq!(tier.price, 100);
        }

        #[ink::test]
        fn tier_subscription_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = SubscriptionManager::new(accounts.alice);
            
            // Bob creates a tier
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let benefits = vec!["Exclusive content".to_string()];
            let tier_id = contract.create_tier("Gold".to_string(), 500, benefits).unwrap();
            
            // Charlie subscribes to the tier
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(accounts.charlie, 10_000_000);
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(500);
            
            contract.subscribe_to_tier(accounts.bob, tier_id).unwrap();
            
            // Check subscription
            assert_eq!(contract.get_subscriber_tier(accounts.charlie, accounts.bob), Some(tier_id));
            assert!(contract.check_tier_access(accounts.charlie, accounts.bob, tier_id));
        }

        #[ink::test]
        fn get_creator_tiers_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = SubscriptionManager::new(accounts.alice);
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            
            // Create multiple tiers
            contract.create_tier("Bronze".to_string(), 100, vec!["Basic".to_string()]).unwrap();
            contract.create_tier("Silver".to_string(), 250, vec!["Medium".to_string()]).unwrap();
            contract.create_tier("Gold".to_string(), 500, vec!["Premium".to_string()]).unwrap();
            
            let tiers = contract.get_creator_tiers(accounts.bob);
            assert_eq!(tiers.len(), 3);
            assert_eq!(tiers[0].name, "Bronze");
            assert_eq!(tiers[1].name, "Silver");
            assert_eq!(tiers[2].name, "Gold");
        }
    }
}

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod subscription_manager {
    use ink::storage::Mapping;

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
    }

    #[ink(storage)]
    pub struct SubscriptionManager {
        /// Mapping from (Subscriber, Creator) -> Expiration Timestamp
        subscriptions: Mapping<(AccountId, AccountId), Timestamp>,
        /// Mapping from Creator -> Monthly Price
        creator_prices: Mapping<AccountId, Balance>,
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

        /// Subscribe to a creator for 30 days.
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
            let existing_expiration = self.subscriptions.get((caller, creator)).unwrap_or(0);
            
            // If expired or new, start from now. If active, extend from current expiration.
            let start_time = if existing_expiration > current_time {
                existing_expiration
            } else {
                current_time
            };

            // Add 30 days (in milliseconds)
            // 30 * 24 * 60 * 60 * 1000 = 2,592,000,000
            let new_expiration = start_time + 2_592_000_000;
            self.subscriptions.insert((caller, creator), &new_expiration);

            Ok(())
        }

        /// Check if a user has an active subscription to a creator.
        #[ink(message)]
        pub fn check_subscription(&self, user: AccountId, creator: AccountId) -> bool {
            let expiration = self.subscriptions.get((user, creator)).unwrap_or(0);
            let current_time = self.env().block_timestamp();
            expiration > current_time
        }

        /// Get the subscription price for a creator.
        #[ink(message)]
        pub fn get_creator_price(&self, creator: AccountId) -> Option<Balance> {
            self.creator_prices.get(creator)
        }
        
        /// Get the expiration timestamp for a subscription.
        #[ink(message)]
        pub fn get_subscription_expiration(&self, user: AccountId, creator: AccountId) -> Timestamp {
            self.subscriptions.get((user, creator)).unwrap_or(0)
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
    }
}

#![cfg_attr(not(feature = "std"), no_std)]

#![allow(clippy::arithmetic_side_effects)]
#![allow(clippy::cast_possible_truncation)]

#[ink::contract]
mod donation_platform {
    use ink::storage::Mapping;

    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum CampaignState {
        Active,
        Successful,
        Failed,
        Cancelled,
    }

    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Campaign {
        owner: AccountId,
        title: ink_prelude::string::String,
        description: ink_prelude::string::String,
        goal: Balance,
        deadline: Timestamp,
        funds_raised: Balance,
        state: CampaignState,
        beneficiary: AccountId,
    }

    #[derive(scale::Encode, scale::Decode, Debug)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Donation {
        donor: AccountId,
        amount: Balance,
        timestamp: Timestamp,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        CampaignNotFound,
        CampaignNotActive,
        DeadlineExceeded,
        DeadlineNotReached,
        InsufficientFunds,
        Unauthorized,
        GoalNotReached,
        GoalAlreadyReached,
        WithdrawalFailed,
        AlreadyClaimed,
        CampaignAlreadyEnded,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(event)]
    pub struct CampaignCreated {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        goal: Balance,
        deadline: Timestamp,
    }

    #[ink(event)]
    pub struct CampaignStateChanged {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        state: CampaignState,
        timestamp: Timestamp,
    }

    #[ink(event)]
    pub struct DonationReceived {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        donor: AccountId,
        amount: Balance,
        current_total: Balance,
    }

    #[ink(event)]
    pub struct FundsWithdrawn {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        beneficiary: AccountId,
        amount: Balance,
        fee_amount: Balance,
    }

    #[ink(event)]
    pub struct RefundProcessed {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        donor: AccountId,
        amount: Balance,
    }

    #[ink(storage)]
    pub struct DonationPlatform {
        campaigns: Mapping<u32, Campaign>,
        campaign_count: u32,
        campaign_donations: Mapping<u32, ink_prelude::vec::Vec<Donation>>,
        donor_total_contributions: Mapping<AccountId, Balance>,
        claimed_donations: Mapping<(u32, AccountId), Balance>,
        admin: AccountId,
        platform_fee: u32,
    }

    impl DonationPlatform {
        #[ink(constructor)]
        pub fn new(platform_fee: u32) -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_count: 0,
                campaign_donations: Mapping::default(),
                donor_total_contributions: Mapping::default(),
                claimed_donations: Mapping::default(),
                admin: Self::env().caller(),
                platform_fee,
            }
        }

        #[ink(message)]
        pub fn create_campaign(
            &mut self,
            title: ink_prelude::string::String,
            description: ink_prelude::string::String,
            goal: Balance,
            deadline: Timestamp,
            beneficiary: AccountId,
        ) -> Result<u32> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            if deadline <= current_time {
                return Err(Error::DeadlineExceeded);
            }

            let campaign = Campaign {
                owner: caller,
                title,
                description,
                goal,
                deadline,
                funds_raised: 0,
                state: CampaignState::Active,
                beneficiary,
            };

            let campaign_id = self.campaign_count;
            self.campaigns.insert(campaign_id, &campaign);
            self.campaign_count += 1;

            self.env().emit_event(CampaignCreated {
                campaign_id,
                goal,
                deadline,
            });

            Ok(campaign_id)
        }

        #[ink(message, payable)]
        pub fn donate(&mut self, campaign_id: u32) -> Result<()> {
            let caller = self.env().caller();
            let donation_amount = self.env().transferred_value();
            let current_time = self.env().block_timestamp();

            // Get and validate campaign
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            if !matches!(campaign.state, CampaignState::Active) {
                return Err(Error::CampaignNotActive);
            }
            
            if current_time > campaign.deadline {
                return Err(Error::DeadlineExceeded);
            }

            // Record donation
            let donation = Donation {
                donor: caller,
                amount: donation_amount,
                timestamp: current_time,
            };

            // Update campaign funds
            campaign.funds_raised += donation_amount;
            self.campaigns.insert(campaign_id, &campaign);

            // Update donor's total contributions
            let prev_total = self.donor_total_contributions.get(caller).unwrap_or(0);
            self.donor_total_contributions.insert(caller, &(prev_total + donation_amount));

            // Add donation to campaign history
            let mut donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
            donations.push(donation);
            self.campaign_donations.insert(campaign_id, &donations);

            self.env().emit_event(DonationReceived {
                campaign_id,
                donor: caller,
                amount: donation_amount,
                current_total: campaign.funds_raised,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn withdraw(&mut self, campaign_id: u32) -> Result<()> {
            let caller = self.env().caller();
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            if campaign.owner != caller {
                return Err(Error::Unauthorized);
            }

            if self.env().block_timestamp() <= campaign.deadline {
                return Err(Error::DeadlineNotReached);
            }

            if campaign.funds_raised < campaign.goal {
                campaign.state = CampaignState::Failed;
                self.campaigns.insert(campaign_id, &campaign);
                return Err(Error::GoalNotReached);
            }

            if !matches!(campaign.state, CampaignState::Active) {
                return Err(Error::CampaignNotActive);
            }

            let fee = (campaign.funds_raised * self.platform_fee as u128) / 10000;
            let amount_to_beneficiary = campaign.funds_raised - fee;

            if self.env().transfer(self.admin, fee).is_err() {
                // Note: In a real-world scenario, this failure should be handled gracefully.
                // For now, we halt the withdrawal.
                return Err(Error::WithdrawalFailed);
            }

            if self.env().transfer(campaign.beneficiary, amount_to_beneficiary).is_err() {
                // Reverting the fee transfer is complex. A pull-over-push pattern is better.
                // For this implementation, we assume it won't fail if the contract has funds.
                return Err(Error::WithdrawalFailed);
            }

            campaign.state = CampaignState::Successful;
            self.campaigns.insert(&campaign_id, &campaign);

            self.env().emit_event(FundsWithdrawn {
                campaign_id,
                beneficiary: campaign.beneficiary,
                amount: amount_to_beneficiary,
                fee_amount: fee,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn cancel_campaign(&mut self, campaign_id: u32) -> Result<()> {
            let caller = self.env().caller();
            let mut campaign = self.campaigns.get(&campaign_id).ok_or(Error::CampaignNotFound)?;

            if campaign.owner != caller {
                return Err(Error::Unauthorized);
            }
            if !matches!(campaign.state, CampaignState::Active) {
                return Err(Error::CampaignAlreadyEnded);
            }

            campaign.state = CampaignState::Cancelled;
            self.campaigns.insert(&campaign_id, &campaign);

            self.env().emit_event(CampaignStateChanged {
                campaign_id,
                state: CampaignState::Cancelled,
                timestamp: self.env().block_timestamp(),
            });

            Ok(())
        }

        #[ink(message)]
        pub fn claim_refund(&mut self, campaign_id: u32) -> Result<()> {
            let caller = self.env().caller();
            let campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            if !matches!(campaign.state, CampaignState::Failed | CampaignState::Cancelled) {
                return Err(Error::CampaignNotActive); // Or a more specific error
            }

            if self.claimed_donations.get((campaign_id, caller)).is_some() {
                return Err(Error::AlreadyClaimed);
            }

            let total_donated = self.campaign_donations.get(campaign_id).unwrap_or_default()
                .iter().filter(|d| d.donor == caller).map(|d| d.amount).sum();

            if total_donated == 0 {
                return Err(Error::InsufficientFunds);
            }

            self.env().emit_event(RefundProcessed {
                campaign_id,
                donor: caller,
                amount: total_donated,
            });

            if self.env().transfer(caller, total_donated).is_err() {
                return Err(Error::WithdrawalFailed);
            }

            self.claimed_donations.insert(&(campaign_id, caller), &total_donated);

            Ok(())
        }

        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }

        #[ink(message)]
        pub fn get_campaign_donations(&self, campaign_id: u32) -> ink_prelude::vec::Vec<Donation> {
            self.campaign_donations.get(&campaign_id).unwrap_or_default()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{
            test::default_accounts,
            DefaultEnvironment,
        };

        fn setup() -> DonationPlatform {
            let accounts = default_accounts::<DefaultEnvironment>();
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.alice);
            DonationPlatform::new(100) // 1% platform fee
        }

        fn create_test_campaign(contract: &mut DonationPlatform) -> u32 {
            contract.create_campaign(
                String::from("Test Campaign"),
                String::from("Test Description"),
                1000,
                ink_env::block_timestamp::<DefaultEnvironment>() + 10000,
                AccountId::from([0x1; 32]),
            ).unwrap()
        }

        #[ink::test]
        fn create_campaign_works() {
            let mut contract = setup();
            let result = create_test_campaign(&mut contract);
            assert_eq!(result, 0);
            
            let campaign = contract.get_campaign(0).unwrap();
            assert_eq!(campaign.title, "Test Campaign");
            assert_eq!(campaign.goal, 1000);
            assert_eq!(campaign.funds_raised, 0);
            assert_eq!(campaign.state, CampaignState::Active);
        }

        #[ink::test]
        fn donate_works() {
            let mut contract = setup();
            let campaign_id = create_test_campaign(&mut contract);
            
            // Set up test accounts
            let accounts = default_accounts::<DefaultEnvironment>();
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            ink::env::test::set_value_transferred::<DefaultEnvironment>(500);

            let result = contract.donate(campaign_id);
            assert!(result.is_ok());

            let campaign = contract.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.funds_raised, 500);

            let donations = contract.get_campaign_donations(campaign_id);
            assert_eq!(donations.len(), 1);
            assert_eq!(donations[0].amount, 500);
            assert_eq!(donations[0].donor, accounts.bob);
        }

        #[ink::test]
        fn withdraw_works() {
            let mut contract = setup();
            let accounts = default_accounts::<DefaultEnvironment>();
            let campaign_id = create_test_campaign(&mut contract);
            
            // Make a donation that meets the goal
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            ink::env::test::set_value_transferred::<DefaultEnvironment>(1000);
            contract.donate(campaign_id).unwrap();

            // Advance time past deadline
            ink::env::test::advance_block::<DefaultEnvironment>();
            let current_timestamp = ink::env::block_timestamp::<DefaultEnvironment>();
            ink::env::test::set_block_timestamp::<DefaultEnvironment>(current_timestamp + 20000);

            // Try to withdraw
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.alice);
            let result = contract.withdraw(campaign_id);
            assert!(result.is_ok());

            let campaign = contract.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.state, CampaignState::Successful);
        }

        #[ink::test]
        fn refund_works() {
            let mut contract = setup();
            let accounts = default_accounts::<DefaultEnvironment>();
            let campaign_id = create_test_campaign(&mut contract);
            
            // Make a donation below the goal
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            ink::env::test::set_value_transferred::<DefaultEnvironment>(500);
            contract.donate(campaign_id).unwrap();

            // Advance time past deadline
            ink::env::test::advance_block::<DefaultEnvironment>();
            let current_timestamp = ink::env::block_timestamp::<DefaultEnvironment>();
            ink::env::test::set_block_timestamp::<DefaultEnvironment>(current_timestamp + 20000);

            // Cancel the campaign
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.alice);
            contract.cancel_campaign(campaign_id).unwrap();

            // Claim refund
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            let result = contract.claim_refund(campaign_id);
            assert!(result.is_ok());
        }

        #[ink::test]
        fn test_unauthorized_actions() {
            let mut contract = setup();
            let accounts = default_accounts::<DefaultEnvironment>();
            let campaign_id = create_test_campaign(&mut contract);

            // Try to withdraw as non-owner
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            let result = contract.withdraw(campaign_id);
            assert!(matches!(result, Err(Error::Unauthorized)));

            // Try to cancel as non-owner
            let result = contract.cancel_campaign(campaign_id);
            assert!(matches!(result, Err(Error::Unauthorized)));
        }

        #[ink::test]
        fn test_campaign_state_transitions() {
            let mut contract = setup();
            let accounts = default_accounts::<DefaultEnvironment>();
            let campaign_id = create_test_campaign(&mut contract);

            // Make a full donation
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            ink::env::test::set_value_transferred::<DefaultEnvironment>(1000);
            contract.donate(campaign_id).unwrap();

            // Advance time past deadline
            let current_timestamp = ink::env::block_timestamp::<DefaultEnvironment>();
            ink::env::test::set_block_timestamp::<DefaultEnvironment>(current_timestamp + 20000);

            // Withdraw should succeed
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.alice);
            let result = contract.withdraw(campaign_id);
            assert!(result.is_ok());

            // Campaign should be marked as successful
            let campaign = contract.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.state, CampaignState::Successful);

            // Further donations should fail
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);
            ink::env::test::set_value_transferred::<DefaultEnvironment>(500);
            let result = contract.donate(campaign_id);
            assert!(matches!(result, Err(Error::CampaignNotActive)));
        }
    }
}

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod donation_platform {
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;
    use ink::storage::Mapping;
    use ink::env::Error as InkError;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Campaign does not exist
        CampaignNotFound,
        /// Campaign is not active
        CampaignNotActive,
        /// Campaign goal already reached
        GoalReached,
        /// Campaign deadline has passed
        DeadlinePassed,
        /// Only campaign owner can perform this action
        NotCampaignOwner,
        /// Campaign goal not reached yet
        GoalNotReached,
        /// Withdrawal failed
        WithdrawalFailed,
        /// Donation amount must be greater than zero
        InvalidDonationAmount,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum CampaignState {
        Active,
        Successful,
        Failed,
        Withdrawn,
    }

    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Donation {
        donor: AccountId,
        amount: Balance,
        timestamp: Timestamp,
    }

    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Campaign {
        id: u32,
        owner: AccountId,
        title: String,
        description: String,
        goal: Balance,
        raised: Balance,
        deadline: Timestamp,
        state: CampaignState,
        beneficiary: AccountId,
    }

    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct CampaignDetails {
        campaign: Campaign,
        donations: Vec<Donation>,
    }

    #[ink(storage)]
    pub struct DonationPlatform {
        campaigns: Mapping<u32, Campaign>,
        campaign_donations: Mapping<u32, Vec<Donation>>,
        campaign_count: u32,
        admin: AccountId,
    }

    impl DonationPlatform {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_donations: Mapping::default(),
                campaign_count: 0,
                admin: Self::env().caller(),
            }
        }

        #[ink(message)]
        pub fn create_campaign(
            &mut self,
            title: String,
            description: String,
            goal: Balance,
            deadline: Timestamp,
            beneficiary: AccountId,
        ) -> Result<u32, Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Ensure deadline is in the future
            assert!(deadline > current_time, "Deadline must be in the future");
            
            // Create new campaign
            let campaign_id = self.campaign_count;
            let campaign = Campaign {
                id: campaign_id,
                owner: caller,
                title,
                description,
                goal,
                raised: 0,
                deadline,
                state: CampaignState::Active,
                beneficiary,
            };
            
            // Store campaign and initialize empty donations list
            self.campaigns.insert(campaign_id, &campaign);
            self.campaign_donations.insert(campaign_id, &Vec::new());
            
            // Increment campaign counter
            self.campaign_count += 1;
            
            // Emit event
            self.env().emit_event(CampaignCreated {
                campaign_id,
                owner: caller,
                goal,
                deadline,
            });
            
            Ok(campaign_id)
        }

        #[ink(message, payable)]
        pub fn donate(&mut self, campaign_id: u32) -> Result<(), Error> {
            let donation_amount = self.env().transferred_value();
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Ensure donation amount is greater than zero
            if donation_amount == 0 {
                return Err(Error::InvalidDonationAmount);
            }
            
            // Get campaign
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;
            
            // Check campaign state
            if campaign.state != CampaignState::Active {
                return Err(Error::CampaignNotActive);
            }
            
            // Check deadline
            if current_time > campaign.deadline {
                campaign.state = CampaignState::Failed;
                self.campaigns.insert(campaign_id, &campaign);
                return Err(Error::DeadlinePassed);
            }
            
            // Record donation
            let donation = Donation {
                donor: caller,
                amount: donation_amount,
                timestamp: current_time,
            };
            
            // Update campaign raised amount
            campaign.raised += donation_amount;
            
            // Check if goal reached
            if campaign.raised >= campaign.goal {
                campaign.state = CampaignState::Successful;
            }
            
            // Update campaign
            self.campaigns.insert(campaign_id, &campaign);
            
            // Add donation to campaign donations
            let mut donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
            donations.push(donation);
            self.campaign_donations.insert(campaign_id, &donations);
            
            // Emit event
            self.env().emit_event(DonationReceived {
                campaign_id,
                donor: caller,
                amount: donation_amount,
            });
            
            Ok(())
        }

        #[ink(message)]
        pub fn withdraw_funds(&mut self, campaign_id: u32) -> Result<(), Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Get campaign
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;
            
            // Check if caller is campaign owner
            if caller != campaign.owner && caller != self.admin {
                return Err(Error::NotCampaignOwner);
            }
            
            // Check campaign state
            if campaign.state == CampaignState::Withdrawn {
                return Err(Error::WithdrawalFailed);
            }
            
            // Check if campaign is successful or deadline has passed
            let is_successful = campaign.state == CampaignState::Successful;
            let deadline_passed = current_time > campaign.deadline;
            
            if !is_successful && !deadline_passed {
                return Err(Error::DeadlinePassed);
            }
            
            // For unsuccessful campaigns after deadline, only return if there are funds
            if !is_successful && campaign.raised == 0 {
                campaign.state = CampaignState::Failed;
                self.campaigns.insert(campaign_id, &campaign);
                return Ok(());
            }
            
            // Transfer funds to beneficiary
            if self.env().transfer(campaign.beneficiary, campaign.raised).is_err() {
                return Err(Error::WithdrawalFailed);
            }
            
            // Update campaign state
            campaign.state = CampaignState::Withdrawn;
            self.campaigns.insert(campaign_id, &campaign);
            
            // Emit event
            self.env().emit_event(FundsWithdrawn {
                campaign_id,
                beneficiary: campaign.beneficiary,
                amount: campaign.raised,
            });
            
            Ok(())
        }

        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }

        #[ink(message)]
        pub fn get_campaign_details(&self, campaign_id: u32) -> Option<CampaignDetails> {
            let campaign = self.campaigns.get(campaign_id)?;
            let donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
            
            Some(CampaignDetails {
                campaign,
                donations,
            })
        }

        #[ink(message)]
        pub fn get_all_campaigns(&self) -> Vec<Campaign> {
            let mut all_campaigns = Vec::new();
            
            for i in 0..self.campaign_count {
                if let Some(campaign) = self.campaigns.get(i) {
                    all_campaigns.push(campaign);
                }
            }
            
            all_campaigns
        }

        #[ink(message)]
        pub fn get_active_campaigns(&self) -> Vec<Campaign> {
            let mut active_campaigns = Vec::new();
            
            for i in 0..self.campaign_count {
                if let Some(campaign) = self.campaigns.get(i) {
                    if campaign.state == CampaignState::Active {
                        active_campaigns.push(campaign);
                    }
                }
            }
            
            active_campaigns
        }
    }

    // Events
    #[ink(event)]
    pub struct CampaignCreated {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        owner: AccountId,
        goal: Balance,
        deadline: Timestamp,
    }

    #[ink(event)]
    pub struct DonationReceived {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        donor: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct FundsWithdrawn {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        beneficiary: AccountId,
        amount: Balance,
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test, DefaultEnvironment};

        #[ink::test]
        fn create_campaign_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut donation_platform = DonationPlatform::new();
            
            let title = String::from("Test Campaign");
            let description = String::from("This is a test campaign");
            let goal = 1000;
            let deadline = 1_000_000;
            let beneficiary = accounts.bob;
            
            let campaign_id = donation_platform.create_campaign(
                title.clone(),
                description.clone(),
                goal,
                deadline,
                beneficiary,
            ).unwrap();
            
            let campaign = donation_platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.title, title);
            assert_eq!(campaign.description, description);
            assert_eq!(campaign.goal, goal);
            assert_eq!(campaign.deadline, deadline);
            assert_eq!(campaign.beneficiary, beneficiary);
            assert_eq!(campaign.state, CampaignState::Active);
        }

        #[ink::test]
        fn donate_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut donation_platform = DonationPlatform::new();
            
            // Create a campaign
            let campaign_id = donation_platform.create_campaign(
                String::from("Test Campaign"),
                String::from("This is a test campaign"),
                1000,
                1_000_000,
                accounts.bob,
            ).unwrap();
            
            // Make a donation
            test::set_value_transferred::<DefaultEnvironment>(500);
            assert!(donation_platform.donate(campaign_id).is_ok());
            
            // Check campaign details
            let campaign = donation_platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.raised, 500);
            
            // Make another donation that reaches the goal
            test::set_value_transferred::<DefaultEnvironment>(500);
            assert!(donation_platform.donate(campaign_id).is_ok());
            
            // Check campaign is now successful
            let campaign = donation_platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.raised, 1000);
            assert_eq!(campaign.state, CampaignState::Successful);
        }

        #[ink::test]
        fn withdraw_funds_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut donation_platform = DonationPlatform::new();
            
            // Create a campaign
            let campaign_id = donation_platform.create_campaign(
                String::from("Test Campaign"),
                String::from("This is a test campaign"),
                1000,
                1_000_000,
                accounts.bob,
            ).unwrap();
            
            // Make a donation that reaches the goal
            test::set_value_transferred::<DefaultEnvironment>(1000);
            assert!(donation_platform.donate(campaign_id).is_ok());
            
            // Withdraw funds
            assert!(donation_platform.withdraw_funds(campaign_id).is_ok());
            
            // Check campaign state
            let campaign = donation_platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.state, CampaignState::Withdrawn);
        }
    }
}

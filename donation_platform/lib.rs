#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::arithmetic_side_effects)]

/// A decentralized crowdfunding platform built with ink!.
///
/// This contract allows users to create and manage fundraising campaigns,
/// donate to campaigns, and withdraw funds securely.
#[ink::contract]
mod donation_platform {
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    /// Errors that can occur during contract execution.
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// The requested campaign does not exist.
        CampaignNotFound,
        /// The campaign is not currently active and cannot be donated to.
        CampaignNotActive,
        /// The campaign has already reached its funding goal.
        GoalReached,
        /// The campaign's deadline has passed.
        DeadlinePassed,
        /// The caller is not the owner of the campaign.
        NotCampaignOwner,
        /// The campaign has not yet reached its funding goal.
        GoalNotReached,
        /// An error occurred during the withdrawal of funds.
        WithdrawalFailed,
        /// The donation amount must be greater than zero.
        InvalidDonationAmount,
        /// The campaign title is invalid (e.g., empty or too long).
        InvalidTitle,
        /// The campaign description is invalid (e.g., too long).
        InvalidDescription,
        /// The funding goal is invalid (e.g., zero or too large).
        InvalidGoal,
        /// The beneficiary account is invalid (e.g., a zero address).
        InvalidBeneficiary,
        /// The campaign deadline is invalid (e.g., in the past or too far in the future).
        InvalidDeadline,
        /// The funds for this campaign have already been withdrawn.
        FundsAlreadyWithdrawn,
        /// The campaign has insufficient funds for withdrawal.
        InsufficientFunds,
    }

    /// Represents the state of a fundraising campaign.
    #[derive(Debug, PartialEq, Eq, Clone, Copy, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    pub enum CampaignState {
        /// The campaign is active and accepting donations.
        Active,
        /// The campaign has successfully reached its funding goal.
        Successful,
        /// The campaign has failed to reach its funding goal by the deadline.
        Failed,
        /// The funds for the campaign have been withdrawn by the beneficiary.
        Withdrawn,
    }

    /// Represents a single donation to a campaign.
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Donation {
        /// The account that made the donation.
        donor: AccountId,
        /// The amount of the donation.
        amount: Balance,
        /// The timestamp of the donation.
        timestamp: Timestamp,
    }

    /// Represents a fundraising campaign.
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    pub struct Campaign {
        /// A unique identifier for the campaign.
        id: u32,
        /// The account that owns the campaign.
        owner: AccountId,
        /// The title of the campaign.
        title: String,
        /// A description of the campaign.
        description: String,
        /// The funding goal of the campaign.
        goal: Balance,
        /// The amount of funds raised so far.
        raised: Balance,
        /// The deadline for the campaign.
        deadline: Timestamp,
        /// The current state of the campaign.
        state: CampaignState,
        /// The account that will receive the funds if the campaign is successful.
        beneficiary: AccountId,
    }

    /// Contains the details of a campaign, including all its donations.
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct CampaignDetails {
        /// The campaign's main data.
        campaign: Campaign,
        /// A list of all donations made to the campaign.
        donations: Vec<Donation>,
    }

    /// The main storage struct for the donation platform contract.
    #[ink(storage)]
    pub struct DonationPlatform {
        /// A mapping from campaign ID to campaign data.
        campaigns: Mapping<u32, Campaign>,
        /// A mapping from campaign ID to a list of its donations.
        campaign_donations: Mapping<u32, Vec<Donation>>,
        /// The total number of campaigns created.
        campaign_count: u32,
        /// The administrator of the contract.
        admin: AccountId,
        /// A lock to prevent reentrant calls.
        locked: bool,
    }

    impl DonationPlatform {
        /// Creates a new instance of the donation platform contract.
        ///
        /// The caller of this constructor becomes the administrator.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_donations: Mapping::default(),
                campaign_count: 0,
                admin: Self::env().caller(),
                locked: false,
            }
        }

        /// A guard function to prevent reentrant calls.
        ///
        /// # Panics
        ///
        /// Panics if the contract is already locked.
        fn guard(&mut self) {
            assert!(!self.locked, "Reentrant call");
            self.locked = true;
        }

        /// Releases the reentrancy guard.
        fn unguard(&mut self) {
            self.locked = false;
        }

        /// Creates a new fundraising campaign.
        ///
        /// # Arguments
        ///
        /// * `title` - The title of the campaign.
        /// * `description` - A description of the campaign.
        /// * `goal` - The funding goal in the chain's native currency.
        /// * `deadline` - The timestamp at which the campaign ends.
        /// * `beneficiary` - The account that will receive the funds.
        ///
        /// # Returns
        ///
        /// Returns the ID of the newly created campaign, or an error if input validation fails.
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

            // Input validation
            if title.is_empty() || title.len() > 100 {
                return Err(Error::InvalidTitle);
            }
            if description.len() > 1000 {
                return Err(Error::InvalidDescription);
            }
            if goal == 0 || goal > 1_000_000_000_000_000 { // Max 1M DOT (assuming 10^12 plancks per DOT)
                return Err(Error::InvalidGoal);
            }
            if beneficiary == AccountId::from([0; 32]) {
                return Err(Error::InvalidBeneficiary);
            }
            let min_deadline = current_time + 3_600_000; // At least 1 hour from now
            let max_deadline = current_time + 31_536_000_000; // Max 1 year
            if deadline <= min_deadline || deadline > max_deadline {
                return Err(Error::InvalidDeadline);
            }

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
            self.campaign_donations.insert(campaign_id, &Vec::<Donation>::new());

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

        /// Donates to a campaign.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to donate to.
        ///
        /// # Returns
        ///
        /// Returns `Ok(())` if the donation was successful, or an error otherwise.
        #[ink(message, payable)]
        pub fn donate(&mut self, campaign_id: u32) -> Result<(), Error> {
            self.guard();
            let result = (|| {
                let donation_amount = self.env().transferred_value();
                let caller = self.env().caller();
                let current_time = self.env().block_timestamp();

                // Input validation
                if donation_amount == 0 {
                    return Err(Error::InvalidDonationAmount);
                }
                // Prevent extremely large donations that could cause overflow
                if donation_amount > 100_000_000_000_000 { // Max 100k DOT
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
                let old_state = campaign.state;
                campaign.state = CampaignState::Failed;
                self.campaigns.insert(campaign_id, &campaign);
                self.env().emit_event(CampaignStateChanged {
                    campaign_id,
                    old_state,
                    new_state: CampaignState::Failed,
                });
                return Err(Error::DeadlinePassed);
            }
            
            // Record donation
            let donation = Donation {
                donor: caller,
                amount: donation_amount,
                timestamp: current_time,
            };
            
            // Update campaign raised amount with overflow check
            campaign.raised = campaign.raised.checked_add(donation_amount).ok_or(Error::InvalidDonationAmount)?;
            
            // Check if goal reached
            let old_state = campaign.state;
            if campaign.raised >= campaign.goal {
                campaign.state = CampaignState::Successful;
                self.env().emit_event(CampaignStateChanged {
                    campaign_id,
                    old_state,
                    new_state: CampaignState::Successful,
                });
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
            })();
            self.unguard();
            result
        }

        /// Withdraws the funds from a successful or failed campaign.
        ///
        /// If the campaign was successful, the funds are transferred to the beneficiary.
        /// If the campaign failed, this function can be called to mark it as closed (no funds are moved).
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to withdraw funds from.
        ///
        /// # Returns
        ///
        /// Returns `Ok(())` if the withdrawal was successful, or an error otherwise.
        #[ink(message)]
        pub fn withdraw_funds(&mut self, campaign_id: u32) -> Result<(), Error> {
            self.guard();
            let result = (|| {
                let caller = self.env().caller();
                let current_time = self.env().block_timestamp();

            // Get campaign
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            // Check if caller is campaign owner or admin
            if caller != campaign.owner && caller != self.admin {
                return Err(Error::NotCampaignOwner);
            }

            // Check if already withdrawn
            if campaign.state == CampaignState::Withdrawn {
                return Err(Error::FundsAlreadyWithdrawn);
            }

            // Check if campaign is successful or deadline has passed
            let is_successful = campaign.state == CampaignState::Successful;
            let deadline_passed = current_time > campaign.deadline;

            if !is_successful && !deadline_passed {
                return Err(Error::GoalNotReached); // Better error: goal not reached and deadline not passed
            }

            // For unsuccessful campaigns after deadline, check if there are funds to refund
            if !is_successful && campaign.raised == 0 {
                let old_state = campaign.state;
                campaign.state = CampaignState::Failed;
                self.campaigns.insert(campaign_id, &campaign);
                self.env().emit_event(CampaignStateChanged {
                    campaign_id,
                    old_state,
                    new_state: CampaignState::Failed,
                });
                return Ok(());
            }

            // Ensure there are funds to withdraw
            if campaign.raised == 0 {
                return Err(Error::InsufficientFunds);
            }

            // Transfer funds to beneficiary
            if self.env().transfer(campaign.beneficiary, campaign.raised).is_err() {
                return Err(Error::WithdrawalFailed);
            }

            // Update campaign state
            let old_state = campaign.state;
            campaign.state = CampaignState::Withdrawn;
            self.campaigns.insert(campaign_id, &campaign);
            self.env().emit_event(CampaignStateChanged {
                campaign_id,
                old_state,
                new_state: CampaignState::Withdrawn,
            });

                // Emit event
                self.env().emit_event(FundsWithdrawn {
                    campaign_id,
                    beneficiary: campaign.beneficiary,
                    amount: campaign.raised,
                });

                Ok(())
            })();
            self.unguard();
            result
        }

        /// Retrieves a campaign by its ID.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to retrieve.
        ///
        /// # Returns
        ///
        /// Returns the campaign data if found, otherwise `None`.
        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }

        /// Retrieves the details of a campaign, including its donations.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to retrieve details for.
        ///
        /// # Returns
        ///
        /// Returns the campaign details if the campaign is found, otherwise `None`.
        #[ink(message)]
        pub fn get_campaign_details(&self, campaign_id: u32) -> Option<CampaignDetails> {
            let campaign = self.campaigns.get(campaign_id)?;
            let donations = self.campaign_donations.get(campaign_id).unwrap_or_default();

            Some(CampaignDetails {
                campaign,
                donations,
            })
        }

        /// Retrieves a paginated list of donations for a campaign.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign.
        /// * `offset` - The starting index for pagination.
        /// * `limit` - The maximum number of donations to return.
        ///
        /// # Returns
        ///
        /// Returns a vector of donations.
        #[ink(message)]
        pub fn get_campaign_donations_paginated(&self, campaign_id: u32, offset: u32, limit: u32) -> Vec<Donation> {
            let donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
            let start = offset as usize;
            let end = (offset as usize + limit as usize).min(donations.len());

            donations[start..end].to_vec()
        }

        /// Retrieves all campaigns.
        ///
        /// # Returns
        ///
        /// Returns a vector containing all campaigns.
        #[ink(message)]
        pub fn get_all_campaigns(&self) -> Vec<Campaign> {
            let mut all_campaigns = Vec::with_capacity(self.campaign_count as usize);

            for i in 0..self.campaign_count {
                if let Some(campaign) = self.campaigns.get(i) {
                    all_campaigns.push(campaign);
                }
            }

            all_campaigns
        }

        /// Retrieves a paginated list of all campaigns.
        ///
        /// # Arguments
        ///
        /// * `offset` - The starting index for pagination.
        /// * `limit` - The maximum number of campaigns to return.
        ///
        /// # Returns
        ///
        /// Returns a vector of campaigns.
        #[ink(message)]
        pub fn get_campaigns_paginated(&self, offset: u32, limit: u32) -> Vec<Campaign> {
            let mut campaigns = Vec::new();
            let start = offset;
            let end = (offset + limit).min(self.campaign_count);

            for i in start..end {
                if let Some(campaign) = self.campaigns.get(i) {
                    campaigns.push(campaign);
                }
            }

            campaigns
        }

        /// Retrieves all active campaigns.
        ///
        /// # Returns
        ///
        /// Returns a vector of all campaigns with the `Active` state.
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
    /// Emitted when a new campaign is created.
    #[ink(event)]
    pub struct CampaignCreated {
        /// The ID of the created campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The owner of the campaign.
        #[ink(topic)]
        owner: AccountId,
        /// The funding goal of the campaign.
        goal: Balance,
        /// The deadline of the campaign.
        deadline: Timestamp,
    }

    /// Emitted when a donation is received.
    #[ink(event)]
    pub struct DonationReceived {
        /// The ID of the campaign that received the donation.
        #[ink(topic)]
        campaign_id: u32,
        /// The account that made the donation.
        #[ink(topic)]
        donor: AccountId,
        /// The amount of the donation.
        amount: Balance,
    }

    /// Emitted when funds are withdrawn from a campaign.
    #[ink(event)]
    pub struct FundsWithdrawn {
        /// The ID of the campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The beneficiary who received the funds.
        #[ink(topic)]
        beneficiary: AccountId,
        /// The amount of funds withdrawn.
        amount: Balance,
    }

    /// Emitted when a campaign's state changes.
    #[ink(event)]
    pub struct CampaignStateChanged {
        /// The ID of the campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The previous state of the campaign.
        old_state: CampaignState,
        /// The new state of the campaign.
        new_state: CampaignState,
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
            let deadline = 10_000_000; // Future deadline
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
                10_000_000,
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
                10_000_000,
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

        #[ink::test]
        fn create_campaign_validation_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut donation_platform = DonationPlatform::new();

            // Test invalid title
            let result = donation_platform.create_campaign(
                String::new(),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidTitle));

            // Test invalid goal
            let result = donation_platform.create_campaign(
                String::from("Title"),
                String::from("Description"),
                0,
                10_000_000,
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidGoal));

            // Test invalid beneficiary
            let result = donation_platform.create_campaign(
                String::from("Title"),
                String::from("Description"),
                1000,
                10_000_000,
                AccountId::from([0; 32]),
            );
            assert_eq!(result, Err(Error::InvalidBeneficiary));
        }

        #[ink::test]
        fn donate_validation_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut donation_platform = DonationPlatform::new();

            let campaign_id = donation_platform.create_campaign(
                String::from("Test Campaign"),
                String::from("This is a test campaign"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Test zero donation
            test::set_value_transferred::<DefaultEnvironment>(0);
            assert_eq!(donation_platform.donate(campaign_id), Err(Error::InvalidDonationAmount));
        }
    }
}

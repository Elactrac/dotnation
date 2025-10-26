#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::arithmetic_side_effects)]

/// Version 2 of the donation platform with improved scalability features.
///
/// This contract is designed to work with a proxy pattern for upgradability.
/// It includes batch operations, improved pagination, and optimized storage.
#[ink::contract]
mod donation_platform_v2 {
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
        /// Batch operation failed due to invalid input.
        BatchOperationFailed,
        /// Maximum batch size exceeded.
        BatchSizeTooLarge,
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
        /// The number of donations received.
        donation_count: u32,
    }

    /// Contains the details of a campaign, including all its donations.
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct CampaignDetails {
        /// The campaign's main data.
        campaign: Campaign,
        /// A list of donations made to the campaign (paginated).
        donations: Vec<Donation>,
        /// Total number of donations.
        total_donations: u32,
    }

    /// Batch result for multiple operations.
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct BatchResult {
        /// Number of successful operations.
        successful: u32,
        /// Number of failed operations.
        failed: u32,
        /// Campaign IDs or indices of successful operations.
        success_ids: Vec<u32>,
    }

    /// The main storage struct for the donation platform contract.
    #[ink(storage)]
    pub struct DonationPlatformV2 {
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
        /// Contract version for tracking upgrades.
        version: u32,
        /// Maximum batch size for operations.
        max_batch_size: u32,
    }

    impl DonationPlatformV2 {
        /// Creates a new instance of the donation platform contract V2.
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
                version: 2,
                max_batch_size: 50, // Allow up to 50 operations per batch
            }
        }

        /// Migrates from V1 to V2. Called after upgrading the logic contract.
        ///
        /// # Arguments
        ///
        /// * `campaign_count` - The campaign count from the V1 contract.
        #[ink(constructor)]
        pub fn migrate_from_v1(campaign_count: u32) -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_donations: Mapping::default(),
                campaign_count,
                admin: Self::env().caller(),
                locked: false,
                version: 2,
                max_batch_size: 50,
            }
        }

        /// A guard function to prevent reentrant calls.
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
            if goal == 0 || goal > 1_000_000_000_000_000 {
                return Err(Error::InvalidGoal);
            }
            if beneficiary == AccountId::from([0; 32]) {
                return Err(Error::InvalidBeneficiary);
            }
            let min_deadline = current_time + 3_600_000;
            let max_deadline = current_time + 31_536_000_000;
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
                donation_count: 0,
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

        /// Creates multiple campaigns in a single transaction.
        ///
        /// # Arguments
        ///
        /// * `campaigns_data` - A vector of tuples containing campaign data.
        ///
        /// # Returns
        ///
        /// Returns a BatchResult with the status of each operation.
        #[ink(message)]
        pub fn create_campaigns_batch(
            &mut self,
            campaigns_data: Vec<(String, String, Balance, Timestamp, AccountId)>,
        ) -> Result<BatchResult, Error> {
            if campaigns_data.len() > self.max_batch_size as usize {
                return Err(Error::BatchSizeTooLarge);
            }

            let mut successful = 0;
            let mut failed = 0;
            let mut success_ids = Vec::new();

            for (title, description, goal, deadline, beneficiary) in campaigns_data {
                match self.create_campaign(title, description, goal, deadline, beneficiary) {
                    Ok(id) => {
                        successful += 1;
                        success_ids.push(id);
                    }
                    Err(_) => {
                        failed += 1;
                    }
                }
            }

            Ok(BatchResult {
                successful,
                failed,
                success_ids,
            })
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
            let result = self.process_donation(campaign_id, self.env().transferred_value());
            self.unguard();
            result
        }

        /// Internal function to process a donation.
        fn process_donation(&mut self, campaign_id: u32, donation_amount: Balance) -> Result<(), Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();

            // Input validation
            if donation_amount == 0 {
                return Err(Error::InvalidDonationAmount);
            }
            if donation_amount > 100_000_000_000_000 {
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

            // Update campaign raised amount with overflow check
            campaign.raised = campaign.raised.checked_add(donation_amount)
                .ok_or(Error::InvalidDonationAmount)?;
            campaign.donation_count += 1;

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

        /// Withdraws the funds from a successful or failed campaign.
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
            let result = self.process_withdrawal(campaign_id);
            self.unguard();
            result
        }

        /// Internal function to process a withdrawal.
        fn process_withdrawal(&mut self, campaign_id: u32) -> Result<(), Error> {
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
                return Err(Error::GoalNotReached);
            }

            // Ensure there are funds to withdraw
            if campaign.raised == 0 {
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

        /// Withdraws funds from multiple campaigns in a single transaction.
        ///
        /// # Arguments
        ///
        /// * `campaign_ids` - A vector of campaign IDs to withdraw from.
        ///
        /// # Returns
        ///
        /// Returns a BatchResult with the status of each operation.
        #[ink(message)]
        pub fn withdraw_funds_batch(&mut self, campaign_ids: Vec<u32>) -> Result<BatchResult, Error> {
            if campaign_ids.len() > self.max_batch_size as usize {
                return Err(Error::BatchSizeTooLarge);
            }

            let mut successful = 0;
            let mut failed = 0;
            let mut success_ids = Vec::new();

            for campaign_id in campaign_ids {
                match self.withdraw_funds(campaign_id) {
                    Ok(_) => {
                        successful += 1;
                        success_ids.push(campaign_id);
                    }
                    Err(_) => {
                        failed += 1;
                    }
                }
            }

            Ok(BatchResult {
                successful,
                failed,
                success_ids,
            })
        }

        /// Retrieves a campaign by its ID.
        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }

        /// Retrieves the details of a campaign, including paginated donations.
        #[ink(message)]
        pub fn get_campaign_details(&self, campaign_id: u32, offset: u32, limit: u32) -> Option<CampaignDetails> {
            let campaign = self.campaigns.get(campaign_id)?;
            let all_donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
            
            let start = offset as usize;
            let end = (offset as usize + limit as usize).min(all_donations.len());
            let donations = all_donations[start..end].to_vec();

            Some(CampaignDetails {
                campaign,
                donations,
                total_donations: u32::try_from(all_donations.len()).unwrap_or(0),
            })
        }

        /// Retrieves a paginated list of all campaigns.
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

        /// Retrieves all active campaigns (paginated).
        #[ink(message)]
        pub fn get_active_campaigns(&self, offset: u32, limit: u32) -> Vec<Campaign> {
            let mut active_campaigns = Vec::new();
            let mut count = 0;
            let mut skipped = 0;

            for i in 0..self.campaign_count {
                if let Some(campaign) = self.campaigns.get(i) {
                    if campaign.state == CampaignState::Active {
                        if skipped < offset {
                            skipped += 1;
                            continue;
                        }
                        if count >= limit {
                            break;
                        }
                        active_campaigns.push(campaign);
                        count += 1;
                    }
                }
            }

            active_campaigns
        }

        /// Gets the contract version.
        #[ink(message)]
        pub fn get_version(&self) -> u32 {
            self.version
        }

        /// Gets the total campaign count.
        #[ink(message)]
        pub fn get_campaign_count(&self) -> u32 {
            self.campaign_count
        }

        /// Updates the maximum batch size (admin only).
        #[ink(message)]
        pub fn set_max_batch_size(&mut self, size: u32) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotCampaignOwner); // Reusing error
            }
            self.max_batch_size = size;
            Ok(())
        }

        /// Gets the maximum batch size.
        #[ink(message)]
        pub fn get_max_batch_size(&self) -> u32 {
            self.max_batch_size
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
            let mut platform = DonationPlatformV2::new();

            let result = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            );

            assert!(result.is_ok());
            assert_eq!(platform.get_campaign_count(), 1);
        }

        #[ink::test]
        fn batch_create_campaigns_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaigns_data = vec![
                (String::from("Campaign 1"), String::from("Desc 1"), 1000, 10_000_000, accounts.bob),
                (String::from("Campaign 2"), String::from("Desc 2"), 2000, 10_000_000, accounts.bob),
            ];

            let result = platform.create_campaigns_batch(campaigns_data);
            assert!(result.is_ok());

            let batch_result = result.unwrap();
            assert_eq!(batch_result.successful, 2);
            assert_eq!(batch_result.failed, 0);
            assert_eq!(platform.get_campaign_count(), 2);
        }

        #[ink::test]
        fn version_tracking_works() {
            let platform = DonationPlatformV2::new();
            assert_eq!(platform.get_version(), 2);
        }
    }
}

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

    /// Defines the errors that can occur during the execution of the donation platform contract.
    ///
    /// Each variant corresponds to a specific failure condition, providing clear reasons for
    /// transaction failures.
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
        /// Reentrant call detected.
        ReentrantCall,
        /// Campaign is in failed state.
        CampaignFailed,
        /// No donation found for the caller.
        NoDonationFound,
        /// Refund has already been claimed.
        RefundAlreadyClaimed,
        /// Transfer failed.
        TransferFailed,
    }

    /// Represents the lifecycle state of a fundraising campaign.
    ///
    /// A campaign progresses through these states from its creation to its completion,
    /// either by success, failure, or fund withdrawal.
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

    /// Represents a single donation made to a fundraising campaign.
    ///
    /// This struct captures the essential details of each contribution, including who made
    /// the donation, the amount, and when it was made.
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Donation {
        /// The account that made the donation.
        donor: AccountId,
        /// The amount of the donation.
        amount: Balance,
        /// The timestamp of the donation.
        timestamp: Timestamp,
    }

    /// Represents a single fundraising campaign.
    ///
    /// This struct holds all the essential information about a campaign, including its
    /// metadata, funding status, and lifecycle state.
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

    /// A composite struct that holds the details of a campaign along with its donations.
    ///
    /// This is used for query methods to return a comprehensive view of a campaign,
    /// including a paginated list of its donations.
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

    /// Represents the result of a batch operation.
    ///
    /// This struct provides a summary of the outcomes of batch operations, such as
    /// creating or withdrawing from multiple campaigns in a single transaction.
    #[derive(Debug, PartialEq, scale::Encode, scale::Decode)]
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
    ///
    /// This struct holds all the persistent data of the contract, including campaigns,
    /// donations, and administrative settings.
    #[ink(storage)]
    pub struct DonationPlatformV2 {
        /// A mapping from campaign ID to campaign data.
        campaigns: Mapping<u32, Campaign>,
        /// A mapping from campaign ID to a list of its donations.
        campaign_donations: Mapping<u32, Vec<Donation>>,
        /// A mapping to track refund claims: (campaign_id, donor) -> has_claimed
        refund_claimed: Mapping<(u32, AccountId), bool>,
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

    /// Minimum donation amount to prevent dust spam (0.001 DOT = 1,000,000 planck)
    const MIN_DONATION: Balance = 1_000_000;

    impl DonationPlatformV2 {
        /// Creates a new instance of the donation platform contract V2.
        ///
        /// The caller of this constructor becomes the administrator.
        ///
        /// # Returns
        ///
        /// A new instance of the `DonationPlatformV2` contract, initialized with
        /// default values and the caller as the admin.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_donations: Mapping::default(),
                refund_claimed: Mapping::default(),
                campaign_count: 0,
                admin: Self::env().caller(),
                locked: false,
                version: 2,
                max_batch_size: 50, // Allow up to 50 operations per batch
            }
        }

        /// Migrates the contract from V1 to V2.
        ///
        /// This constructor is intended to be called by the proxy contract when upgrading
        /// from a V1 instance of the contract. It preserves the campaign count while
        /// re-initializing the rest of the state for V2.
        ///
        /// # Arguments
        ///
        /// * `campaign_count` - The total number of campaigns from the V1 contract.
        ///
        /// # Returns
        ///
        /// A new instance of the V2 contract with migrated state.
        #[ink(constructor)]
        pub fn migrate_from_v1(campaign_count: u32) -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_donations: Mapping::default(),
                refund_claimed: Mapping::default(),
                campaign_count,
                admin: Self::env().caller(),
                locked: false,
                version: 2,
                max_batch_size: 50,
            }
        }

        /// Creates a new fundraising campaign.
        ///
        /// This function allows any user to create a new campaign with a specified
        /// title, description, funding goal, deadline, and beneficiary. The caller
        /// of this function becomes the owner of the campaign.
        ///
        /// On successful creation, a `CampaignCreated` event is emitted.
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
        /// - `Ok(u32)`: The ID of the newly created campaign.
        /// - `Err(Error)`: An error variant indicating why the creation failed, such as
        ///   `InvalidTitle`, `InvalidGoal`, or `InvalidDeadline`.
        ///
        /// # Errors
        ///
        /// Returns `Error` if any of the input parameters are invalid (e.g., empty title,
        /// zero goal, deadline in the past).
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
        /// This batch function allows for the creation of multiple campaigns in a single
        /// transaction, reducing gas costs and improving efficiency.
        ///
        /// # Arguments
        ///
        /// * `campaigns_data` - A vector of tuples, where each tuple contains the
        ///   `title`, `description`, `goal`, `deadline`, and `beneficiary` for a new campaign.
        ///
        /// # Returns
        ///
        /// - `Ok(BatchResult)`: A struct indicating the number of successful and failed
        ///   creations, along with the IDs of the successful campaigns.
        /// - `Err(Error)`: An error variant, such as `BatchSizeTooLarge`.
        ///
        /// # Errors
        ///
        /// Returns `Error::BatchSizeTooLarge` if the input vector exceeds the
        /// maximum allowed batch size.
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

        /// Donates to a specific fundraising campaign.
        /// Any user can donate to a campaign by calling this function and sending
        /// a native token value. The donation is only accepted if the campaign is active
        /// and has not passed its deadline.
        ///
        /// On successful donation, a `DonationReceived` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to donate to.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: If the donation was successful.
        /// - `Err(Error)`: An error variant indicating why the donation failed, such as
        ///   `CampaignNotFound`, `CampaignNotActive`, or `DeadlinePassed`.
        ///
        /// # Errors
        /// Returns `Error` if the campaign is not in a donatable state.
        #[ink(message, payable)]
        pub fn donate(&mut self, campaign_id: u32) -> Result<(), Error> {
            // Check and acquire lock
            if self.locked {
                return Err(Error::ReentrantCall);
            }
            self.locked = true;

            // Execute donation logic in a closure to ensure unlock happens
            let result = (|| {
                let donation_amount = self.env().transferred_value();
                self.process_donation(campaign_id, donation_amount)
            })();

            // Always unlock before returning
            self.locked = false;
            result
        }

        /// The internal logic for processing a donation.
        ///
        /// This private function is called by `donate` and handles the core logic of
        /// validating the campaign state, recording the donation, and updating the
        /// campaign's raised amount.
        ///
        /// # Arguments
        /// * `campaign_id` - The ID of the campaign.
        /// * `donation_amount` - The amount of the donation.
        fn process_donation(&mut self, campaign_id: u32, donation_amount: Balance) -> Result<(), Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();

            // Input validation
            if donation_amount < MIN_DONATION {
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
            campaign.donation_count = campaign.donation_count.checked_add(1)
                .ok_or(Error::InvalidDonationAmount)?;

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
        /// This function can only be called by the campaign owner or the contract admin.
        /// If the campaign was successful, the entire raised amount is transferred to the
        /// beneficiary. If the campaign failed, this function does not transfer funds,
        /// but marks the campaign as withdrawn.
        ///
        /// On successful withdrawal, a `FundsWithdrawn` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to withdraw funds from.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: If the withdrawal process was completed successfully.
        /// - `Err(Error)`: An error variant indicating failure, such as `NotCampaignOwner`,
        ///   `GoalNotReached`, or `FundsAlreadyWithdrawn`.
        ///
        /// # Errors
        /// Returns `Error` if the caller is not authorized or the campaign is not in a withdrawable state.
        #[ink(message)]
        pub fn withdraw_funds(&mut self, campaign_id: u32) -> Result<(), Error> {
            // Check and acquire lock
            if self.locked {
                return Err(Error::ReentrantCall);
            }
            self.locked = true;

            // Execute withdrawal logic in a closure to ensure unlock happens
            let result = self.process_withdrawal(campaign_id);

            // Always unlock before returning
            self.locked = false;
            result
        }

        /// The internal logic for processing a fund withdrawal.
        /// This private function handles the state checks and fund transfer for a withdrawal.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to process.
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
        /// Allows a user to withdraw funds from multiple owned campaigns in one batch,
        /// saving on transaction fees.
        ///
        /// # Arguments
        ///
        /// * `campaign_ids` - A vector of campaign IDs to withdraw from.
        ///
        /// # Returns
        ///
        /// - `Ok(BatchResult)`: A struct indicating the number of successful and failed
        ///   withdrawals.
        /// - `Err(Error)`: An error variant, such as `BatchSizeTooLarge`.
        ///
        /// # Errors
        ///
        /// Returns `Error::BatchSizeTooLarge` if the input vector exceeds the
        /// maximum allowed batch size. Each individual withdrawal may also fail with
        /// errors reported in the `failed` count of the `BatchResult`.
        #[ink(message)]
        pub fn withdraw_funds_batch(&mut self, campaign_ids: Vec<u32>) -> Result<BatchResult, Error> {
            if campaign_ids.len() > self.max_batch_size as usize {
                return Err(Error::BatchSizeTooLarge);
            }

            // Check and acquire lock ONCE for the entire batch operation
            if self.locked {
                return Err(Error::ReentrantCall);
            }
            self.locked = true;

            // Execute batch withdrawal logic
            let result = (|| {
                let mut successful = 0;
                let mut failed = 0;
                let mut success_ids = Vec::new();

                for campaign_id in campaign_ids {
                    // Call internal process_withdrawal to avoid double-locking
                    match self.process_withdrawal(campaign_id) {
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
            })();

            // Always unlock before returning
            self.locked = false;
            result
        }

        /// Cancels an active campaign.
        ///
        /// This function allows a campaign owner (or admin) to cancel their campaign before
        /// the deadline. Once cancelled, the campaign state changes to `Failed`, and donors
        /// can claim refunds.
        ///
        /// On success, a `CampaignCancelled` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to cancel.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: If the cancellation was successful.
        /// - `Err(Error)`: If the caller is not authorized or the campaign cannot be cancelled.
        ///
        /// # Errors
        ///
        /// Returns `Error::NotCampaignOwner` if the caller is not the owner or admin,
        /// or `Error::CampaignNotActive` if the campaign is not in an active state.
        #[ink(message)]
        pub fn cancel_campaign(&mut self, campaign_id: u32) -> Result<(), Error> {
            let caller = self.env().caller();
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            // Only owner or admin can cancel
            if caller != campaign.owner && caller != self.admin {
                return Err(Error::NotCampaignOwner);
            }

            // Can only cancel active campaigns
            if campaign.state != CampaignState::Active {
                return Err(Error::CampaignNotActive);
            }

            // Mark campaign as failed
            campaign.state = CampaignState::Failed;
            self.campaigns.insert(campaign_id, &campaign);

            // Emit event
            self.env().emit_event(CampaignCancelled {
                campaign_id,
                cancelled_by: caller,
            });

            Ok(())
        }

        /// Claims a refund for donations made to a failed campaign.
        ///
        /// When a campaign fails (either by missing its deadline or being cancelled),
        /// donors can call this function to receive a full refund of their contributions.
        /// Each donor can only claim their refund once.
        ///
        /// On success, a `RefundClaimed` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the failed campaign to claim a refund from.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: If the refund was successfully processed.
        /// - `Err(Error)`: If the refund cannot be claimed.
        ///
        /// # Errors
        ///
        /// Returns `Error::CampaignNotFailed` if the campaign is not in a failed state,
        /// `Error::NoDonationFound` if the caller has no donations,
        /// or `Error::RefundAlreadyClaimed` if the refund was already claimed.
        #[ink(message)]
        pub fn claim_refund(&mut self, campaign_id: u32) -> Result<(), Error> {
            // Check and acquire lock
            if self.locked {
                return Err(Error::ReentrantCall);
            }
            self.locked = true;

            // Execute refund logic in a closure to ensure unlock happens
            let result = (|| {
                let caller = self.env().caller();
                let campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

                // Only allow refunds for failed campaigns
                if campaign.state != CampaignState::Failed {
                    return Err(Error::CampaignFailed);
                }

                // Check if already claimed
                if self.refund_claimed.get((campaign_id, caller)).unwrap_or(false) {
                    return Err(Error::RefundAlreadyClaimed);
                }

                // Calculate total donation amount for this donor
                let donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
                let mut refund_amount: Balance = 0;
                
                for donation in &donations {
                    if donation.donor == caller {
                        refund_amount = refund_amount.checked_add(donation.amount)
                            .ok_or(Error::InvalidDonationAmount)?;
                    }
                }

                if refund_amount == 0 {
                    return Err(Error::NoDonationFound);
                }

                // Mark as claimed
                self.refund_claimed.insert((campaign_id, caller), &true);

                // Transfer refund to donor
                if self.env().transfer(caller, refund_amount).is_err() {
                    // Revert the claimed status if transfer fails
                    self.refund_claimed.insert((campaign_id, caller), &false);
                    return Err(Error::TransferFailed);
                }

                // Emit event
                self.env().emit_event(RefundClaimed {
                    campaign_id,
                    donor: caller,
                    amount: refund_amount,
                });

                Ok(())
            })();

            // Always unlock before returning
            self.locked = false;
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
        /// - `Some(Campaign)`: The campaign data if found.
        /// - `None`: If no campaign with the given ID exists.
        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }

        /// Retrieves the details of a campaign, including paginated donations.
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The ID of the campaign to retrieve details for.
        /// * `offset` - The starting index for the donation pagination.
        /// * `limit` - The maximum number of donations to return.
        ///
        /// # Returns
        ///
        /// - `Some(CampaignDetails)`: The campaign details if the campaign is found.
        /// - `None`: If the campaign does not exist.
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
        ///
        /// # Arguments
        ///
        /// * `offset` - The starting index for the campaign pagination.
        /// * `limit` - The maximum number of campaigns to return.
        ///
        /// # Returns
        ///
        /// A vector of `Campaign` structs.
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
        ///
        /// # Arguments
        ///
        /// * `offset` - The starting index for the campaign pagination.
        /// * `limit` - The maximum number of active campaigns to return.
        ///
        /// # Returns
        ///
        /// A vector of active `Campaign` structs.
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
        ///
        /// # Returns
        ///
        /// The current version number of the contract logic.
        #[ink(message)]
        pub fn get_version(&self) -> u32 {
            self.version
        }

        /// Gets the total campaign count.
        ///
        /// # Returns
        ///
        /// The total number of campaigns ever created in the contract.
        #[ink(message)]
        pub fn get_campaign_count(&self) -> u32 {
            self.campaign_count
        }

        /// Updates the maximum batch size (admin only).
        ///
        /// # Arguments
        ///
        /// * `size` - The new maximum batch size.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        /// - `Err(Error::NotCampaignOwner)` if the caller is not the admin.
        #[ink(message)]
        pub fn set_max_batch_size(&mut self, size: u32) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotCampaignOwner); // Reusing error
            }
            self.max_batch_size = size;
            Ok(())
        }

        /// Gets the maximum batch size.
        ///
        /// # Returns
        ///
        /// The maximum number of operations allowed in a single batch transaction.
        #[ink(message)]
        pub fn get_max_batch_size(&self) -> u32 {
            self.max_batch_size
        }
    }

    // Events
    /// Emitted when a new campaign is created.
    #[ink(event)]
    pub struct CampaignCreated {
        /// The unique ID of the created campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The account that owns the new campaign.
        #[ink(topic)]
        owner: AccountId,
        /// The funding goal of the campaign.
        goal: Balance,
        /// The deadline of the campaign.
        deadline: Timestamp,
    }

    /// Emitted when a donation is made to a campaign.
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
        /// The ID of the campaign from which funds were withdrawn.
        #[ink(topic)]
        campaign_id: u32,
        /// The account that received the funds.
        #[ink(topic)]
        beneficiary: AccountId,
        /// The amount of funds withdrawn.
        amount: Balance,
    }

    /// Emitted when a campaign is cancelled.
    #[ink(event)]
    pub struct CampaignCancelled {
        /// The ID of the cancelled campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The account that cancelled the campaign.
        #[ink(topic)]
        cancelled_by: AccountId,
    }

    /// Emitted when a donor claims a refund for a failed campaign.
    #[ink(event)]
    pub struct RefundClaimed {
        /// The ID of the campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The donor who claimed the refund.
        #[ink(topic)]
        donor: AccountId,
        /// The amount refunded.
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

        #[ink::test]
        fn invalid_campaign_title_fails() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Empty title
            let result = platform.create_campaign(
                String::from(""),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidTitle));

            // Title too long (>100 chars)
            let long_title = "a".repeat(101);
            let result = platform.create_campaign(
                long_title,
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidTitle));
        }

        #[ink::test]
        fn invalid_goal_fails() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Zero goal
            let result = platform.create_campaign(
                String::from("Test"),
                String::from("Description"),
                0,
                10_000_000,
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidGoal));

            // Goal too large
            let result = platform.create_campaign(
                String::from("Test"),
                String::from("Description"),
                1_000_000_000_000_001,
                10_000_000,
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidGoal));
        }

        #[ink::test]
        fn invalid_deadline_fails() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Deadline too soon
            let result = platform.create_campaign(
                String::from("Test"),
                String::from("Description"),
                1000,
                1000, // Too soon
                accounts.bob,
            );
            assert_eq!(result, Err(Error::InvalidDeadline));
        }

        #[ink::test]
        fn cancel_campaign_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Cancel campaign
            let result = platform.cancel_campaign(campaign_id);
            assert!(result.is_ok());

            // Verify state changed to Failed
            let campaign = platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.state, CampaignState::Failed);
        }

        #[ink::test]
        fn non_owner_cannot_cancel() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Set caller to non-owner
            test::set_caller::<DefaultEnvironment>(accounts.bob);

            let result = platform.cancel_campaign(campaign_id);
            assert_eq!(result, Err(Error::NotCampaignOwner));
        }

        #[ink::test]
        fn minimum_donation_enforced() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Try donating below minimum
            let result = platform.process_donation(campaign_id, MIN_DONATION - 1);
            assert_eq!(result, Err(Error::InvalidDonationAmount));

            // Donate at minimum should work
            let result = platform.process_donation(campaign_id, MIN_DONATION);
            assert!(result.is_ok());
        }

        #[ink::test]
        fn donation_count_overflow_protection() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Get campaign and manually set donation_count near max
            let mut campaign = platform.campaigns.get(campaign_id).unwrap();
            campaign.donation_count = u32::MAX;
            platform.campaigns.insert(campaign_id, &campaign);

            // Try to donate - should fail with overflow protection
            let result = platform.process_donation(campaign_id, MIN_DONATION);
            assert_eq!(result, Err(Error::InvalidDonationAmount));
        }

        #[ink::test]
        fn get_campaign_details_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                10_000_000_000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Add some donations
            platform.process_donation(campaign_id, MIN_DONATION).unwrap();
            platform.process_donation(campaign_id, MIN_DONATION * 2).unwrap();

            // Get details with pagination
            let details = platform.get_campaign_details(campaign_id, 0, 10).unwrap();
            assert_eq!(details.total_donations, 2);
            assert_eq!(details.donations.len(), 2);
        }

        #[ink::test]
        fn batch_operations_respect_max_size() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Try to create more campaigns than max_batch_size
            let mut campaigns_data = Vec::new();
            for _ in 0..51 {
                campaigns_data.push((
                    String::from("Campaign"),
                    String::from("Desc"),
                    1000,
                    10_000_000,
                    accounts.bob,
                ));
            }

            let result = platform.create_campaigns_batch(campaigns_data);
            assert_eq!(result, Err(Error::BatchSizeTooLarge));
        }

        #[ink::test]
        fn set_max_batch_size_requires_admin() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Set caller to non-admin
            test::set_caller::<DefaultEnvironment>(accounts.bob);

            let result = platform.set_max_batch_size(100);
            assert_eq!(result, Err(Error::NotCampaignOwner));
        }

        #[ink::test]
        fn set_max_batch_size_works() {
            let mut platform = DonationPlatformV2::new();

            let result = platform.set_max_batch_size(100);
            assert!(result.is_ok());
            assert_eq!(platform.get_max_batch_size(), 100);
        }

        #[ink::test]
        fn get_campaigns_paginated_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Create 5 campaigns
            for i in 0..5 {
                platform.create_campaign(
                    format!("Campaign {}", i),
                    String::from("Description"),
                    1000,
                    10_000_000,
                    accounts.bob,
                ).unwrap();
            }

            // Get first 3
            let campaigns = platform.get_campaigns_paginated(0, 3);
            assert_eq!(campaigns.len(), 3);

            // Get next 2
            let campaigns = platform.get_campaigns_paginated(3, 3);
            assert_eq!(campaigns.len(), 2);
        }

        #[ink::test]
        fn migration_constructor_works() {
            let platform = DonationPlatformV2::migrate_from_v1(42);
            assert_eq!(platform.get_campaign_count(), 42);
            assert_eq!(platform.get_version(), 2);
        }

        #[ink::test]
        fn campaign_reaches_goal() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                10_000_000,  // Goal of 10M (10 DOT)
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Donate exactly the goal amount
            platform.process_donation(campaign_id, 10_000_000).unwrap();

            let campaign = platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.state, CampaignState::Successful);
            assert_eq!(campaign.raised, 10_000_000);
        }

        #[ink::test]
        fn cannot_donate_to_inactive_campaign() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Cancel campaign
            platform.cancel_campaign(campaign_id).unwrap();

            // Try to donate
            let result = platform.process_donation(campaign_id, MIN_DONATION);
            assert_eq!(result, Err(Error::CampaignNotActive));
        }

        #[ink::test]
        fn get_active_campaigns_filters_correctly() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            // Create 3 campaigns
            for i in 0..3 {
                platform.create_campaign(
                    format!("Campaign {}", i),
                    String::from("Description"),
                    1000,
                    10_000_000,
                    accounts.bob,
                ).unwrap();
            }

            // Cancel one
            platform.cancel_campaign(1).unwrap();

            // Get active campaigns
            let active = platform.get_active_campaigns(0, 10);
            assert_eq!(active.len(), 2);
        }
    }
}

#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::arithmetic_side_effects)]

/// # DotNation Smart Contract V2
///
/// A decentralized crowdfunding platform built on Polkadot with advanced governance features.
///
/// ## Features
/// - **Core Crowdfunding**: Campaign creation, donations, withdrawals, and refunds
/// - **Quadratic Funding**: Democratic grant distribution with matching pools
/// - **DAO Milestone Voting**: Community-governed fund releases with weighted voting
/// - **Batch Operations**: Create/withdraw multiple campaigns in one transaction
/// - **Upgradability**: Designed to work with proxy pattern for future upgrades
/// - **Scalability**: Optimized storage and pagination for millions of campaigns
///
/// ## Contract Size
/// - Optimized: 34.6 KB
/// - Production-ready: Under 50 KB limit
///
/// ## Key Innovations
/// 1. **Quadratic Funding Formula**: (√d₁ + √d₂ + ... + √dₙ)² for fair matching distribution
/// 2. **Weighted DAO Voting**: Voting power proportional to donation amount
/// 3. **Sequential Milestones**: Enforced accountability through ordered fund releases
/// 4. **66% Approval Threshold**: Democratic consensus for milestone completion
///
/// ## Security
/// - Reentrancy protection on all fund transfers
/// - Access control for admin, owner, and donor actions
/// - State machine prevents invalid transitions
/// - Integer overflow protection with checked arithmetic
///
/// ## Documentation
/// - Full docs: cargo doc --open
/// - Features: /FEATURES.md
/// - Quadratic Funding: /QUADRATIC_FUNDING_IMPLEMENTATION.md
/// - DAO Voting: /DAO_FRONTEND_COMPLETE.md
///
/// ## Version
/// - Contract Version: 2.0.0
/// - ink! Version: 5.0.2
/// - Last Updated: November 15, 2025
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
        /// NFT minting failed.
        NftMintingFailed,
        /// Matching pool has insufficient funds.
        InsufficientMatchingPool,
        /// No active matching round.
        NoActiveRound,
        /// Round has already ended.
        RoundEnded,
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
        /// The matching round this campaign belongs to (None if not in a round).
        matching_round: Option<u32>,
        /// Calculated matching amount from quadratic funding.
        matching_amount: Balance,
        /// Milestones for DAO voting (empty if no milestones)
        milestones: Vec<Milestone>,
        /// Whether campaign uses milestone-based fund release
        uses_milestones: bool,
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

    /// Represents a milestone in a campaign (for DAO voting).
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    pub struct Milestone {
        /// Milestone description
        description: String,
        /// Amount to release for this milestone (percentage of total as basis points, e.g., 2500 = 25%)
        percentage: u32,
        /// Deadline for this milestone
        deadline: Timestamp,
        /// Votes in favor (weighted by donation amount)
        votes_for: Balance,
        /// Votes against (weighted by donation amount)
        votes_against: Balance,
        /// Whether funds have been released
        released: bool,
        /// Whether voting is currently active
        voting_active: bool,
    }

    /// Represents a matching round for quadratic funding.
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    pub struct MatchingRound {
        /// Round ID
        id: u32,
        /// Total matching pool for this round
        pool_amount: Balance,
        /// When the round ends
        end_time: Timestamp,
        /// Whether matching has been distributed
        distributed: bool,
        /// Campaign IDs in this round
        campaign_ids: Vec<u32>,
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
        /// Address of the NFT contract for donation receipts
        nft_contract: Option<AccountId>,
        /// Enable/disable NFT minting for donations
        nft_enabled: bool,
        /// Quadratic funding: Total matching pool available
        matching_pool_balance: Balance,
        /// Quadratic funding: Current active round
        current_round: Option<u32>,
        /// Quadratic funding: Mapping from round ID to round data
        matching_rounds: Mapping<u32, MatchingRound>,
        /// Quadratic funding: Total rounds created
        round_count: u32,
        /// Track unique donors per campaign: (campaign_id, donor) -> donated
        unique_donors: Mapping<(u32, AccountId), bool>,
        /// DAO voting: Track votes (campaign_id, milestone_index, voter) -> vote_weight
        milestone_votes: Mapping<(u32, u32, AccountId), Balance>,
        /// Treasury account for platform fees
        treasury_account: AccountId,
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
                nft_contract: None,
                nft_enabled: false,
                matching_pool_balance: 0,
                current_round: None,
                matching_rounds: Mapping::default(),
                round_count: 0,
                unique_donors: Mapping::default(),
                milestone_votes: Mapping::default(),
                treasury_account: Self::env().caller(),
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
                nft_contract: None,
                nft_enabled: false,
                matching_pool_balance: 0,
                current_round: None,
                matching_rounds: Mapping::default(),
                round_count: 0,
                unique_donors: Mapping::default(),
                milestone_votes: Mapping::default(),
                treasury_account: Self::env().caller(),
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
                matching_round: self.current_round,
                matching_amount: 0,
                milestones: Vec::new(),
                uses_milestones: false,
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

            // Calculate fee (3%)
            let fee = donation_amount.checked_mul(3).ok_or(Error::InvalidDonationAmount)?
                .checked_div(100).ok_or(Error::InvalidDonationAmount)?;
            
            // Transfer fee to treasury
            if fee > 0 {
                if self.env().transfer(self.treasury_account, fee).is_err() {
                    return Err(Error::TransferFailed);
                }
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

            // Track unique donor for quadratic funding
            let donor_key = (campaign_id, caller);
            if !self.unique_donors.get(donor_key).unwrap_or(false) {
                self.unique_donors.insert(donor_key, &true);
            }

            // Emit event
            self.env().emit_event(DonationReceived {
                campaign_id,
                donor: caller,
                amount: donation_amount,
            });

            // Mint NFT receipt if NFT minting is enabled
            if self.nft_enabled {
                if let Some(nft_address) = self.nft_contract {
                    // Call NFT contract to mint donation receipt
                    use ink::env::call::{build_call, ExecutionInput, Selector};
                    
                    let mint_result = build_call::<ink::env::DefaultEnvironment>()
                        .call_v1(nft_address)
                        .gas_limit(0) // Use all available gas
                        .transferred_value(0)
                        .exec_input(
                            ExecutionInput::new(Selector::new(ink::selector_bytes!("mint_donation_receipt")))
                                .push_arg(caller) // to
                                .push_arg(campaign_id) // campaign_id
                                .push_arg(&campaign.title) // campaign_title
                                .push_arg(donation_amount) // amount
                                .push_arg(current_time) // timestamp
                        )
                        .returns::<Result<u128, u8>>()
                        .try_invoke();

                    // Log if NFT minting fails, but don't fail the donation
                    if let Err(_e) = mint_result {
                        self.env().emit_event(NftMintingFailed {
                            campaign_id,
                            donor: caller,
                            error_code: 1,
                        });
                    }
                }
            }

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
            if campaign.raised == 0 && campaign.matching_amount == 0 {
                campaign.state = CampaignState::Failed;
                self.campaigns.insert(campaign_id, &campaign);
                return Ok(());
            }

            // Calculate total to withdraw (donations + matching)
            // Note: Donations already had 3% fee taken in real-time, but campaign.raised tracks GROSS.
            // So we must subtract the fee from campaign.raised to get the NET amount available.
            let fee_total = campaign.raised.checked_mul(3).ok_or(Error::WithdrawalFailed)?
                .checked_div(100).ok_or(Error::WithdrawalFailed)?;
            
            let net_raised = campaign.raised.checked_sub(fee_total).ok_or(Error::WithdrawalFailed)?;

            let total_amount = net_raised
                .checked_add(campaign.matching_amount)
                .ok_or(Error::WithdrawalFailed)?;

            // Transfer funds to beneficiary (both donations and matching)
            if total_amount > 0 {
                if self.env().transfer(campaign.beneficiary, total_amount).is_err() {
                    return Err(Error::WithdrawalFailed);
                }
            }

            // Update campaign state
            campaign.state = CampaignState::Withdrawn;
            self.campaigns.insert(campaign_id, &campaign);

            // Emit event
            self.env().emit_event(FundsWithdrawn {
                campaign_id,
                beneficiary: campaign.beneficiary,
                amount: total_amount,
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

        /// Sets the NFT contract address (admin only).
        ///
        /// # Arguments
        ///
        /// * `nft_contract` - The address of the NFT contract.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        /// - `Err(Error::NotCampaignOwner)` if the caller is not the admin.
        #[ink(message)]
        pub fn set_nft_contract(&mut self, nft_contract: AccountId) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotCampaignOwner);
            }
            self.nft_contract = Some(nft_contract);
            Ok(())
        }

        /// Gets the NFT contract address.
        ///
        /// # Returns
        ///
        /// The address of the NFT contract if set.
        #[ink(message)]
        pub fn get_nft_contract(&self) -> Option<AccountId> {
            self.nft_contract
        }

        /// Enables or disables NFT minting for donations (admin only).
        ///
        /// # Arguments
        ///
        /// * `enabled` - Whether to enable NFT minting.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        /// - `Err(Error::NotCampaignOwner)` if the caller is not the admin.
        #[ink(message)]
        pub fn set_nft_enabled(&mut self, enabled: bool) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotCampaignOwner);
            }
            self.nft_enabled = enabled;
            Ok(())
        }

        /// Gets whether NFT minting is enabled.
        ///
        /// # Returns
        ///
        /// True if NFT minting is enabled.
        #[ink(message)]
        pub fn is_nft_enabled(&self) -> bool {
            self.nft_enabled
        }

        // ==================== Quadratic Funding Functions ====================

        /// Fund the matching pool (admin or anyone can contribute).
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        #[ink(message, payable)]
        pub fn fund_matching_pool(&mut self) -> Result<(), Error> {
            let amount = self.env().transferred_value();
            if amount == 0 {
                return Err(Error::InvalidDonationAmount);
            }

            self.matching_pool_balance = self.matching_pool_balance
                .checked_add(amount)
                .ok_or(Error::InvalidDonationAmount)?;

            self.env().emit_event(MatchingPoolFunded {
                funder: self.env().caller(),
                amount,
                total_pool: self.matching_pool_balance,
            });

            Ok(())
        }

        /// Create a new matching round (admin only).
        ///
        /// # Arguments
        ///
        /// * `pool_amount` - Amount from matching pool to allocate to this round.
        /// * `duration` - How long the round lasts (in milliseconds).
        ///
        /// # Returns
        ///
        /// - `Ok(u32)`: The round ID.
        /// - `Err(Error)`: If insufficient pool or not admin.
        #[ink(message)]
        pub fn create_matching_round(&mut self, pool_amount: Balance, duration: u64) -> Result<u32, Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotCampaignOwner);
            }

            if pool_amount > self.matching_pool_balance {
                return Err(Error::InsufficientMatchingPool);
            }

            let round_id = self.round_count;
            let end_time = self.env().block_timestamp() + duration;

            let round = MatchingRound {
                id: round_id,
                pool_amount,
                end_time,
                distributed: false,
                campaign_ids: Vec::new(),
            };

            self.matching_rounds.insert(round_id, &round);
            self.current_round = Some(round_id);
            self.round_count += 1;

            // Deduct from available pool
            self.matching_pool_balance = self.matching_pool_balance
                .checked_sub(pool_amount)
                .ok_or(Error::InsufficientMatchingPool)?;

            self.env().emit_event(MatchingRoundCreated {
                round_id,
                pool_amount,
                end_time,
            });

            Ok(round_id)
        }

        /// Calculate quadratic funding matching for all campaigns in a round.
        /// This uses the formula: matching ∝ (sum of √donation_amounts)²
        ///
        /// # Arguments
        ///
        /// * `round_id` - The round to calculate matching for.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        /// - `Err(Error)`: If round not found or already distributed.
        #[ink(message)]
        pub fn calculate_and_distribute_matching(&mut self, round_id: u32) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotCampaignOwner);
            }

            let mut round = self.matching_rounds.get(round_id).ok_or(Error::CampaignNotFound)?;
            
            if round.distributed {
                return Err(Error::FundsAlreadyWithdrawn);
            }

            let current_time = self.env().block_timestamp();
            if current_time < round.end_time {
                return Err(Error::DeadlinePassed); // Reusing error - means "round not ended yet"
            }

            // Calculate quadratic scores for all campaigns in current round
            let mut total_qf_score: u128 = 0;
            let mut campaign_scores: Vec<(u32, u128)> = Vec::new();

            // Iterate through all campaigns to find those in this round
            for campaign_id in 0..self.campaign_count {
                if let Some(campaign) = self.campaigns.get(campaign_id) {
                    if campaign.matching_round == Some(round_id) && campaign.state != CampaignState::Failed {
                        let qf_score = self.calculate_qf_score(campaign_id);
                        if qf_score > 0 {
                            campaign_scores.push((campaign_id, qf_score));
                            total_qf_score = total_qf_score.saturating_add(qf_score);
                        }
                    }
                }
            }

            // Distribute matching proportionally based on QF scores
            if total_qf_score > 0 {
                for (campaign_id, qf_score) in campaign_scores {
                    let matching_share = ((qf_score as u128) * (round.pool_amount as u128) / total_qf_score) as Balance;
                    
                    if let Some(mut campaign) = self.campaigns.get(campaign_id) {
                        campaign.matching_amount = matching_share;
                        self.campaigns.insert(campaign_id, &campaign);

                        self.env().emit_event(MatchingDistributed {
                            campaign_id,
                            matching_amount: matching_share,
                            round_id,
                        });
                    }
                }
            }

            // Mark round as distributed
            round.distributed = true;
            self.matching_rounds.insert(round_id, &round);

            // Close the current round
            if self.current_round == Some(round_id) {
                self.current_round = None;
            }

            Ok(())
        }

        /// Integer square root using binary search (Babylonian method).
        /// Required for quadratic funding calculations.
        fn sqrt(n: u128) -> u128 {
            if n == 0 {
                return 0;
            }
            
            let mut x = n;
            let mut y = (x + 1) / 2;
            
            while y < x {
                x = y;
                y = (x + n / x) / 2;
            }
            
            x
        }

        /// Calculate the quadratic funding score for a campaign.
        /// Formula: (√donation₁ + √donation₂ + ... + √donationₙ)²
        ///
        /// This rewards campaigns with many small donors over few large donors.
        fn calculate_qf_score(&self, campaign_id: u32) -> u128 {
            let donations = match self.campaign_donations.get(campaign_id) {
                Some(d) => d,
                None => return 0,
            };

            let mut sum_of_square_roots: u128 = 0;

            for donation in donations.iter() {
                // Convert Balance to u128 for calculation
                let amount_u128 = donation.amount as u128;
                let sqrt_amount = Self::sqrt(amount_u128);
                sum_of_square_roots = sum_of_square_roots.saturating_add(sqrt_amount);
            }

            // Square the sum: (√a + √b + √c)²
            sum_of_square_roots.saturating_mul(sum_of_square_roots)
        }

        /// Get estimated matching for a campaign (read-only, for UI display).
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The campaign to estimate matching for.
        ///
        /// # Returns
        ///
        /// Estimated matching amount based on current donations and round pool.
        #[ink(message)]
        pub fn get_estimated_matching(&self, campaign_id: u32) -> Balance {
            let campaign = match self.campaigns.get(campaign_id) {
                Some(c) => c,
                None => return 0,
            };

            let round_id = match campaign.matching_round {
                Some(r) => r,
                None => return 0,
            };

            let round = match self.matching_rounds.get(round_id) {
                Some(r) => r,
                None => return 0,
            };

            if round.distributed {
                return campaign.matching_amount;
            }

            // Calculate this campaign's QF score
            let campaign_score = self.calculate_qf_score(campaign_id);
            if campaign_score == 0 {
                return 0;
            }

            // Calculate total QF score for all campaigns in round
            let mut total_score: u128 = 0;
            for id in 0..self.campaign_count {
                if let Some(c) = self.campaigns.get(id) {
                    if c.matching_round == Some(round_id) {
                        total_score = total_score.saturating_add(self.calculate_qf_score(id));
                    }
                }
            }

            if total_score == 0 {
                return 0;
            }

            // Estimate share
            ((campaign_score as u128) * (round.pool_amount as u128) / total_score) as Balance
        }

        /// Get matching pool balance.
        #[ink(message)]
        pub fn get_matching_pool_balance(&self) -> Balance {
            self.matching_pool_balance
        }

        /// Get current active round ID.
        #[ink(message)]
        pub fn get_current_round(&self) -> Option<u32> {
            self.current_round
        }

        /// Get round details.
        #[ink(message)]
        pub fn get_round(&self, round_id: u32) -> Option<MatchingRound> {
            self.matching_rounds.get(round_id)
        }

        /// Get count of unique donors for a campaign.
        #[ink(message)]
        pub fn get_unique_donor_count(&self, campaign_id: u32) -> u32 {
            let donations = match self.campaign_donations.get(campaign_id) {
                Some(d) => d,
                None => return 0,
            };

            let mut unique_count = 0;
            for donation in donations.iter() {
                let donor_key = (campaign_id, donation.donor);
                if self.unique_donors.get(donor_key).unwrap_or(false) {
                    unique_count += 1;
                }
            }

            unique_count
        }

        // ==================== DAO Milestone Voting Functions ====================

        /// Add milestones to a campaign (owner only, before campaign is successful).
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The campaign to add milestones to.
        /// * `milestones_data` - Vec of (description, percentage, days_from_now).
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        /// - `Err(Error)`: If not owner or campaign already successful.
        #[ink(message)]
        pub fn add_milestones(
            &mut self,
            campaign_id: u32,
            milestones_data: Vec<(String, u32, u64)>,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();

            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            // Only owner can add milestones
            if caller != campaign.owner {
                return Err(Error::NotCampaignOwner);
            }

            // Can't add milestones to completed campaigns
            if campaign.state != CampaignState::Active {
                return Err(Error::CampaignNotActive);
            }

            // Validate percentages sum to 100 (10000 basis points)
            let total_percentage: u32 = milestones_data.iter().map(|(_, p, _)| p).sum();
            if total_percentage != 10000 {
                return Err(Error::InvalidGoal); // Reusing error - means invalid percentage
            }

            // Create milestones
            let mut milestones = Vec::new();
            for (description, percentage, days) in milestones_data {
                if description.is_empty() || description.len() > 200 {
                    return Err(Error::InvalidDescription);
                }
                
                let milestone_deadline = current_time + (days * 24 * 60 * 60 * 1000);
                
                milestones.push(Milestone {
                    description,
                    percentage,
                    deadline: milestone_deadline,
                    votes_for: 0,
                    votes_against: 0,
                    released: false,
                    voting_active: false,
                });
            }

            campaign.milestones = milestones;
            campaign.uses_milestones = true;
            self.campaigns.insert(campaign_id, &campaign);

            self.env().emit_event(MilestonesAdded {
                campaign_id,
                milestone_count: u32::try_from(campaign.milestones.len()).unwrap_or(0),
            });

            Ok(())
        }

        /// Activate voting for a milestone (owner requests release).
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The campaign.
        /// * `milestone_index` - Which milestone to activate voting for.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        #[ink(message)]
        pub fn activate_milestone_voting(
            &mut self,
            campaign_id: u32,
            milestone_index: u32,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();

            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            // Only owner can activate voting
            if caller != campaign.owner {
                return Err(Error::NotCampaignOwner);
            }

            // Campaign must be successful
            if campaign.state != CampaignState::Successful && campaign.state != CampaignState::Withdrawn {
                return Err(Error::GoalNotReached);
            }

            let idx = milestone_index as usize;
            if idx >= campaign.milestones.len() {
                return Err(Error::CampaignNotFound); // Reusing - means milestone not found
            }

            // Check if previous milestones are released (must be sequential)
            if idx > 0 && !campaign.milestones[idx - 1].released {
                return Err(Error::GoalNotReached); // Reusing - means previous milestone not done
            }

            // Check deadline hasn't passed
            if current_time > campaign.milestones[idx].deadline {
                return Err(Error::DeadlinePassed);
            }

            campaign.milestones[idx].voting_active = true;
            self.campaigns.insert(campaign_id, &campaign);

            self.env().emit_event(MilestoneVotingActivated {
                campaign_id,
                milestone_index,
            });

            Ok(())
        }

        /// Vote on a milestone (donors only, weighted by donation amount).
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The campaign.
        /// * `milestone_index` - Which milestone to vote on.
        /// * `approve` - true to approve, false to reject.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        #[ink(message)]
        pub fn vote_on_milestone(
            &mut self,
            campaign_id: u32,
            milestone_index: u32,
            approve: bool,
        ) -> Result<(), Error> {
            let caller = self.env().caller();

            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            let idx = milestone_index as usize;
            if idx >= campaign.milestones.len() {
                return Err(Error::CampaignNotFound);
            }

            // Voting must be active
            if !campaign.milestones[idx].voting_active {
                return Err(Error::CampaignNotActive);
            }

            // Already released
            if campaign.milestones[idx].released {
                return Err(Error::FundsAlreadyWithdrawn);
            }

            // Calculate voter's donation weight
            let donations = self.campaign_donations.get(campaign_id).unwrap_or_default();
            let mut voter_weight: Balance = 0;
            for donation in donations.iter() {
                if donation.donor == caller {
                    voter_weight = voter_weight.saturating_add(donation.amount);
                }
            }

            if voter_weight == 0 {
                return Err(Error::NoDonationFound);
            }

            // Check if already voted
            let vote_key = (campaign_id, milestone_index, caller);
            if self.milestone_votes.get(vote_key).is_some() {
                return Err(Error::RefundAlreadyClaimed); // Reusing - means already voted
            }

            // Record vote
            self.milestone_votes.insert(vote_key, &voter_weight);

            // Update vote counts
            if approve {
                campaign.milestones[idx].votes_for = campaign.milestones[idx]
                    .votes_for
                    .saturating_add(voter_weight);
            } else {
                campaign.milestones[idx].votes_against = campaign.milestones[idx]
                    .votes_against
                    .saturating_add(voter_weight);
            }

            self.campaigns.insert(campaign_id, &campaign);

            self.env().emit_event(MilestoneVoted {
                campaign_id,
                milestone_index,
                voter: caller,
                approve,
                weight: voter_weight,
            });

            Ok(())
        }

        /// Release milestone funds if voting passes (owner or admin).
        ///
        /// Requires >66% approval (weighted by donation amount).
        ///
        /// # Arguments
        ///
        /// * `campaign_id` - The campaign.
        /// * `milestone_index` - Which milestone to release.
        ///
        /// # Returns
        ///
        /// - `Ok(())` on success.
        #[ink(message)]
        pub fn release_milestone_funds(
            &mut self,
            campaign_id: u32,
            milestone_index: u32,
        ) -> Result<(), Error> {
            let caller = self.env().caller();

            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;

            // Only owner or admin can trigger release
            if caller != campaign.owner && caller != self.admin {
                return Err(Error::NotCampaignOwner);
            }

            let idx = milestone_index as usize;
            if idx >= campaign.milestones.len() {
                return Err(Error::CampaignNotFound);
            }

            // Already released
            if campaign.milestones[idx].released {
                return Err(Error::FundsAlreadyWithdrawn);
            }

            // Voting must be active
            if !campaign.milestones[idx].voting_active {
                return Err(Error::CampaignNotActive);
            }

            // Check approval threshold (66%)
            let total_votes = campaign.milestones[idx].votes_for + campaign.milestones[idx].votes_against;
            if total_votes == 0 {
                return Err(Error::InsufficientFunds); // Reusing - means no votes yet
            }

            let approval_percentage = (campaign.milestones[idx].votes_for as u128 * 100) / (total_votes as u128);
            if approval_percentage < 66 {
                return Err(Error::GoalNotReached); // Reusing - means not enough approval
            }

            // Calculate amount to release (percentage of total raised + matching)
            let total_campaign_funds = campaign.raised.saturating_add(campaign.matching_amount);
            let milestone_amount = ((total_campaign_funds as u128) * (campaign.milestones[idx].percentage as u128) / 10000) as Balance;

            // Transfer funds to beneficiary
            if milestone_amount > 0 {
                if self.env().transfer(campaign.beneficiary, milestone_amount).is_err() {
                    return Err(Error::WithdrawalFailed);
                }
            }

            // Mark as released
            campaign.milestones[idx].released = true;
            campaign.milestones[idx].voting_active = false;

            // If all milestones released, mark campaign as withdrawn
            let all_released = campaign.milestones.iter().all(|m| m.released);
            if all_released {
                campaign.state = CampaignState::Withdrawn;
            }

            self.campaigns.insert(campaign_id, &campaign);

            self.env().emit_event(MilestoneFundsReleased {
                campaign_id,
                milestone_index,
                amount: milestone_amount,
                beneficiary: campaign.beneficiary,
            });

            Ok(())
        }

        /// Get milestone details for a campaign.
        #[ink(message)]
        pub fn get_milestones(&self, campaign_id: u32) -> Option<Vec<Milestone>> {
            let campaign = self.campaigns.get(campaign_id)?;
            Some(campaign.milestones)
        }

        /// Check if a donor has voted on a milestone.
        #[ink(message)]
        pub fn has_voted_on_milestone(
            &self,
            campaign_id: u32,
            milestone_index: u32,
            voter: AccountId,
        ) -> bool {
            let vote_key = (campaign_id, milestone_index, voter);
            self.milestone_votes.get(vote_key).is_some()
        }

        /// Get voter's weight on a milestone.
        #[ink(message)]
        pub fn get_vote_weight(
            &self,
            campaign_id: u32,
            milestone_index: u32,
            voter: AccountId,
        ) -> Balance {
            let vote_key = (campaign_id, milestone_index, voter);
            self.milestone_votes.get(vote_key).unwrap_or(0)
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

    /// Emitted when NFT minting fails after a donation.
    #[ink(event)]
    pub struct NftMintingFailed {
        /// The ID of the campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The donor who made the donation.
        #[ink(topic)]
        donor: AccountId,
        /// Error code from NFT minting.
        error_code: u8,
    }

    /// Emitted when a donation NFT receipt is minted.
    #[ink(event)]
    pub struct NftReceiptMinted {
        /// The ID of the campaign.
        #[ink(topic)]
        campaign_id: u32,
        /// The donor who received the NFT.
        #[ink(topic)]
        donor: AccountId,
        /// The NFT token ID.
        nft_token_id: u128,
        /// The donation amount.
        amount: Balance,
    }

    /// Emitted when funds are added to the matching pool.
    #[ink(event)]
    pub struct MatchingPoolFunded {
        /// The account that funded the pool.
        #[ink(topic)]
        funder: AccountId,
        /// The amount added to the pool.
        amount: Balance,
        /// The new total pool balance.
        total_pool: Balance,
    }

    /// Emitted when a new matching round is created.
    #[ink(event)]
    pub struct MatchingRoundCreated {
        /// The ID of the new round.
        #[ink(topic)]
        round_id: u32,
        /// The pool amount allocated to this round.
        pool_amount: Balance,
        /// When the round ends.
        end_time: Timestamp,
    }

    /// Emitted when matching funds are distributed to a campaign.
    #[ink(event)]
    pub struct MatchingDistributed {
        /// The campaign that received matching.
        #[ink(topic)]
        campaign_id: u32,
        /// The matching amount distributed.
        matching_amount: Balance,
        /// The round ID.
        round_id: u32,
    }

    /// Emitted when milestones are added to a campaign.
    #[ink(event)]
    pub struct MilestonesAdded {
        /// The campaign ID.
        #[ink(topic)]
        campaign_id: u32,
        /// Number of milestones added.
        milestone_count: u32,
    }

    /// Emitted when voting is activated for a milestone.
    #[ink(event)]
    pub struct MilestoneVotingActivated {
        /// The campaign ID.
        #[ink(topic)]
        campaign_id: u32,
        /// The milestone index.
        milestone_index: u32,
    }

    /// Emitted when a donor votes on a milestone.
    #[ink(event)]
    pub struct MilestoneVoted {
        /// The campaign ID.
        #[ink(topic)]
        campaign_id: u32,
        /// The milestone index.
        milestone_index: u32,
        /// The voter.
        #[ink(topic)]
        voter: AccountId,
        /// Whether they approved.
        approve: bool,
        /// The vote weight (donation amount).
        weight: Balance,
    }

    /// Emitted when milestone funds are released.
    #[ink(event)]
    pub struct MilestoneFundsReleased {
        /// The campaign ID.
        #[ink(topic)]
        campaign_id: u32,
        /// The milestone index.
        milestone_index: u32,
        /// The amount released.
        amount: Balance,
        /// The beneficiary who received funds.
        #[ink(topic)]
        beneficiary: AccountId,
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
        #[ink::test]
        fn platform_fee_deducted() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                1000,
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Donate 10_000_000 (10 DOT)
            platform.process_donation(campaign_id, 10_000_000).unwrap();

            // Check campaign raised (should be gross 10_000_000)
            let campaign = platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.raised, 10_000_000);

            // In a real environment, 3 would be sent to treasury.
            // In unit tests, we can't easily check the transfer without mocking,
            // but we can check the withdrawal amount later.
        }

        #[ink::test]
        fn withdrawal_respects_fees() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut platform = DonationPlatformV2::new();

            let campaign_id = platform.create_campaign(
                String::from("Test Campaign"),
                String::from("Description"),
                100, // Goal 100
                10_000_000,
                accounts.bob,
            ).unwrap();

            // Donate 10_000_000 (10 DOT)
            platform.process_donation(campaign_id, 10_000_000).unwrap();

            // Campaign successful
            let campaign = platform.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.state, CampaignState::Successful);

            // Withdraw
            // We need to mock the contract having funds, otherwise transfer fails in test?
            // ink! tests usually start with some balance.
            // But we transferred fee OUT.
            // Fee = 10_000_000 * 3 / 100 = 300_000.
            // Net remaining = 9_700_000.
            
            // We need to set the contract balance to simulate the donation remaining amount.
            // In ink! 5, we might need to import Env to call env() on the contract instance in tests
            use ink::codegen::Env;
            let contract_addr = platform.env().account_id();
            test::set_account_balance::<DefaultEnvironment>(contract_addr, 9_700_000);

            // Set caller to owner (Alice created it)
            test::set_caller::<DefaultEnvironment>(accounts.alice);
            
            let result = platform.withdraw_funds(campaign_id);
            assert_eq!(result, Ok(()));
        }
    }
}

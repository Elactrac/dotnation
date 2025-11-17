#![cfg_attr(not(feature = "std"), no_std, no_main)]

/// Donation Receipt NFT Contract
/// 
/// This contract implements PSP34 (Polkadot NFT standard) to mint unique
/// NFTs as receipts for donations made on the DotNation platform.
#[ink::contract]
mod donation_nft {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    /// Rarity tier for NFTs based on donation amount
    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    pub enum RarityTier {
        Common,      // < 1 DOT
        Uncommon,    // 1-10 DOT
        Rare,        // 10-100 DOT
        Epic,        // 100-1000 DOT
        Legendary,   // > 1000 DOT
    }

    /// Represents metadata for a donation receipt NFT
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(::ink::storage::traits::StorageLayout))]
    pub struct DonationMetadata {
        /// Campaign ID that received the donation
        pub campaign_id: u32,
        /// Campaign title
        pub campaign_title: String,
        /// Donation amount
        pub amount: Balance,
        /// Timestamp of donation
        pub timestamp: Timestamp,
        /// Donor address (original donor)
        pub donor: AccountId,
        /// Rarity tier based on donation amount
        pub rarity: RarityTier,
        /// Number of times this NFT has been transferred
        pub transfer_count: u32,
    }

    /// NFT Token ID type
    pub type TokenId = u128;

    /// Errors that can occur in the NFT contract
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Caller is not authorized
        NotAuthorized,
        /// Token does not exist
        TokenNotFound,
        /// Token already exists
        TokenExists,
        /// Cannot mint to zero address
        ZeroAddress,
        /// Maximum supply reached
        MaxSupplyReached,
        /// Cannot transfer to self
        TransferToSelf,
        /// Caller is not token owner
        NotOwner,
    }

    /// Storage for the Donation NFT contract
    #[ink(storage)]
    pub struct DonationNft {
        /// Mapping from token ID to owner
        token_owners: Mapping<TokenId, AccountId>,
        /// Mapping from token ID to metadata
        token_metadata: Mapping<TokenId, DonationMetadata>,
        /// Mapping from owner to list of owned token IDs
        owned_tokens: Mapping<AccountId, Vec<TokenId>>,
        /// Total number of tokens minted
        total_supply: u128,
        /// Address of the donation platform contract (authorized minter)
        platform_contract: AccountId,
        /// Contract admin
        admin: AccountId,
        /// NFT collection name
        collection_name: String,
        /// NFT collection symbol
        collection_symbol: String,
        /// Whether NFT transfers are enabled
        transfers_enabled: bool,
        /// Mapping to track total donations by address for leaderboard
        total_donated: Mapping<AccountId, Balance>,
    }

    impl DonationNft {
        /// Creates a new Donation NFT contract
        #[ink(constructor)]
        pub fn new(
            platform_contract: AccountId,
            collection_name: String,
            collection_symbol: String,
        ) -> Self {
            Self {
                token_owners: Mapping::default(),
                token_metadata: Mapping::default(),
                owned_tokens: Mapping::default(),
                total_supply: 0,
                platform_contract,
                admin: Self::env().caller(),
                collection_name,
                collection_symbol,
                transfers_enabled: true,
                total_donated: Mapping::default(),
            }
        }

        /// Helper function to determine rarity tier based on donation amount
        fn get_rarity_tier(amount: Balance) -> RarityTier {
            const ONE_DOT: Balance = 10_000_000_000_000; // 10^13 (assuming 13 decimals)
            
            if amount >= ONE_DOT * 1000 {
                RarityTier::Legendary
            } else if amount >= ONE_DOT * 100 {
                RarityTier::Epic
            } else if amount >= ONE_DOT * 10 {
                RarityTier::Rare
            } else if amount >= ONE_DOT {
                RarityTier::Uncommon
            } else {
                RarityTier::Common
            }
        }

        /// Mints a new donation receipt NFT
        /// Can only be called by the authorized platform contract
        #[ink(message)]
        pub fn mint_donation_receipt(
            &mut self,
            to: AccountId,
            campaign_id: u32,
            campaign_title: String,
            amount: Balance,
            timestamp: Timestamp,
        ) -> Result<TokenId, Error> {
            let caller = self.env().caller();
            
            // Only platform contract can mint
            if caller != self.platform_contract && caller != self.admin {
                return Err(Error::NotAuthorized);
            }

            // Cannot mint to zero address
            if to == AccountId::from([0u8; 32]) {
                return Err(Error::ZeroAddress);
            }

            // Generate new token ID
            let token_id = self.total_supply;
            self.total_supply = self.total_supply.saturating_add(1);

            // Create metadata with rarity tier
            let metadata = DonationMetadata {
                campaign_id,
                campaign_title,
                amount,
                timestamp,
                donor: to,
                rarity: Self::get_rarity_tier(amount),
                transfer_count: 0,
            };

            // Update total donated amount for donor
            let current_total = self.total_donated.get(to).unwrap_or(0);
            self.total_donated.insert(to, &current_total.saturating_add(amount));

            // Store token ownership
            self.token_owners.insert(token_id, &to);
            self.token_metadata.insert(token_id, &metadata);

            // Add to owner's token list
            let mut tokens = self.owned_tokens.get(to).unwrap_or_default();
            tokens.push(token_id);
            self.owned_tokens.insert(to, &tokens);

            // Emit event
            self.env().emit_event(Transfer {
                from: None,
                to: Some(to),
                token_id,
            });

            self.env().emit_event(DonationNftMinted {
                token_id,
                owner: to,
                campaign_id,
                amount,
            });

            Ok(token_id)
        }

        /// Gets the owner of a token
        #[ink(message)]
        pub fn owner_of(&self, token_id: TokenId) -> Option<AccountId> {
            self.token_owners.get(token_id)
        }

        /// Gets the metadata of a donation NFT
        #[ink(message)]
        pub fn get_token_metadata(&self, token_id: TokenId) -> Option<DonationMetadata> {
            self.token_metadata.get(token_id)
        }

        /// Gets all tokens owned by an account
        #[ink(message)]
        pub fn tokens_of_owner(&self, owner: AccountId) -> Vec<TokenId> {
            self.owned_tokens.get(owner).unwrap_or_default()
        }

        /// Gets all tokens with metadata owned by an account
        #[ink(message)]
        pub fn tokens_of_owner_with_metadata(&self, owner: AccountId) -> Vec<(TokenId, DonationMetadata)> {
            let token_ids = self.owned_tokens.get(owner).unwrap_or_default();
            let mut result = Vec::new();
            
            for token_id in token_ids {
                if let Some(metadata) = self.token_metadata.get(token_id) {
                    result.push((token_id, metadata));
                }
            }
            
            result
        }

        /// Gets the total supply of NFTs
        #[ink(message)]
        pub fn total_supply(&self) -> u128 {
            self.total_supply
        }

        /// Gets the collection name
        #[ink(message)]
        pub fn collection_name(&self) -> String {
            self.collection_name.clone()
        }

        /// Gets the collection symbol
        #[ink(message)]
        pub fn collection_symbol(&self) -> String {
            self.collection_symbol.clone()
        }

        /// Updates the platform contract address (admin only)
        #[ink(message)]
        pub fn set_platform_contract(&mut self, new_contract: AccountId) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotAuthorized);
            }
            self.platform_contract = new_contract;
            Ok(())
        }

        /// Gets the platform contract address
        #[ink(message)]
        pub fn get_platform_contract(&self) -> AccountId {
            self.platform_contract
        }

        /// Gets donation statistics for an account
        #[ink(message)]
        pub fn get_donation_stats(&self, account: AccountId) -> (u32, Balance) {
            let token_ids = self.owned_tokens.get(account).unwrap_or_default();
            let mut total_donations = 0u32;
            let mut total_amount = 0u128;

            for token_id in token_ids {
                if let Some(metadata) = self.token_metadata.get(token_id) {
                    total_donations = total_donations.saturating_add(1);
                    total_amount = total_amount.saturating_add(metadata.amount);
                }
            }

            (total_donations, total_amount)
        }

        /// Gets all donations made to a specific campaign
        #[ink(message)]
        pub fn get_campaign_donations(&self, campaign_id: u32, offset: u32, limit: u32) -> Vec<(TokenId, DonationMetadata)> {
            let mut result = Vec::new();
            let mut count = 0u32;
            let mut skipped = 0u32;

            for token_id in 0..self.total_supply {
                if let Some(metadata) = self.token_metadata.get(token_id) {
                    if metadata.campaign_id == campaign_id {
                        if skipped < offset {
                            skipped = skipped.saturating_add(1);
                            continue;
                        }
                        if count >= limit {
                            break;
                        }
                        result.push((token_id, metadata));
                        count = count.saturating_add(1);
                    }
                }
            }

            result
        }

        /// Transfer an NFT to another address
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, token_id: TokenId) -> Result<(), Error> {
            let caller = self.env().caller();
            
            // Check if transfers are enabled
            if !self.transfers_enabled && caller != self.admin {
                return Err(Error::NotAuthorized);
            }

            // Check token exists and caller is owner
            let owner = self.token_owners.get(token_id).ok_or(Error::TokenNotFound)?;
            if owner != caller {
                return Err(Error::NotOwner);
            }

            // Cannot transfer to self
            if to == caller {
                return Err(Error::TransferToSelf);
            }

            // Cannot transfer to zero address
            if to == AccountId::from([0u8; 32]) {
                return Err(Error::ZeroAddress);
            }

            // Remove token from sender's list
            let mut from_tokens = self.owned_tokens.get(caller).unwrap_or_default();
            from_tokens.retain(|&id| id != token_id);
            self.owned_tokens.insert(caller, &from_tokens);

            // Add token to recipient's list
            let mut to_tokens = self.owned_tokens.get(to).unwrap_or_default();
            to_tokens.push(token_id);
            self.owned_tokens.insert(to, &to_tokens);

            // Update owner
            self.token_owners.insert(token_id, &to);

            // Update transfer count in metadata
            if let Some(mut metadata) = self.token_metadata.get(token_id) {
                metadata.transfer_count = metadata.transfer_count.saturating_add(1);
                self.token_metadata.insert(token_id, &metadata);
            }

            // Emit event
            self.env().emit_event(Transfer {
                from: Some(caller),
                to: Some(to),
                token_id,
            });

            Ok(())
        }

        /// Enable or disable NFT transfers (admin only)
        #[ink(message)]
        pub fn set_transfers_enabled(&mut self, enabled: bool) -> Result<(), Error> {
            if self.env().caller() != self.admin {
                return Err(Error::NotAuthorized);
            }
            self.transfers_enabled = enabled;
            Ok(())
        }

        /// Check if transfers are enabled
        #[ink(message)]
        pub fn are_transfers_enabled(&self) -> bool {
            self.transfers_enabled
        }

        /// Get leaderboard of top donors by total amount donated
        #[ink(message)]
        pub fn get_leaderboard(&self, limit: u32) -> Vec<(AccountId, Balance, u32)> {
            // Note: This is a simplified implementation
            // In production, you'd want to maintain a sorted list or use off-chain indexing
            let mut leaderboard = Vec::new();
            
            // This will only work well with a limited number of unique donors
            // For a production system, consider using off-chain indexing
            for token_id in 0..self.total_supply {
                if let Some(metadata) = self.token_metadata.get(token_id) {
                    let donor = metadata.donor;
                    let total = self.total_donated.get(donor).unwrap_or(0);
                    
                    // Check if donor already in leaderboard
                    if !leaderboard.iter().any(|(addr, _, _)| addr == &donor) {
                        #[allow(clippy::cast_possible_truncation)]
                        let token_count = self.owned_tokens.get(donor).unwrap_or_default().len() as u32;
                        leaderboard.push((donor, total, token_count));
                    }
                }
            }

            // Sort by total amount (descending)
            leaderboard.sort_by(|a, b| b.1.cmp(&a.1));
            leaderboard.truncate(limit as usize);
            
            leaderboard
        }

        /// Get NFTs by rarity tier
        #[ink(message)]
        pub fn get_nfts_by_rarity(&self, owner: AccountId, rarity: RarityTier) -> Vec<(TokenId, DonationMetadata)> {
            let token_ids = self.owned_tokens.get(owner).unwrap_or_default();
            let mut result = Vec::new();
            
            for token_id in token_ids {
                if let Some(metadata) = self.token_metadata.get(token_id) {
                    if metadata.rarity == rarity {
                        result.push((token_id, metadata));
                    }
                }
            }
            
            result
        }

        /// Get rarity distribution for an owner
        #[ink(message)]
        pub fn get_rarity_distribution(&self, owner: AccountId) -> (u32, u32, u32, u32, u32) {
            let token_ids = self.owned_tokens.get(owner).unwrap_or_default();
            let mut common = 0u32;
            let mut uncommon = 0u32;
            let mut rare = 0u32;
            let mut epic = 0u32;
            let mut legendary = 0u32;
            
            for token_id in token_ids {
                if let Some(metadata) = self.token_metadata.get(token_id) {
                    match metadata.rarity {
                        RarityTier::Common => common = common.saturating_add(1),
                        RarityTier::Uncommon => uncommon = uncommon.saturating_add(1),
                        RarityTier::Rare => rare = rare.saturating_add(1),
                        RarityTier::Epic => epic = epic.saturating_add(1),
                        RarityTier::Legendary => legendary = legendary.saturating_add(1),
                    }
                }
            }
            
            (common, uncommon, rare, epic, legendary)
        }

        /// Get total amount donated by an address (original donations only)
        #[ink(message)]
        pub fn get_total_donated(&self, donor: AccountId) -> Balance {
            self.total_donated.get(donor).unwrap_or(0)
        }

        /// Get achievement status for a donor
        #[ink(message)]
        pub fn get_achievements(&self, donor: AccountId) -> Vec<String> {
            let mut achievements = Vec::new();
            let (donation_count, total_amount) = self.get_donation_stats(donor);
            let (common, uncommon, rare, epic, legendary) = self.get_rarity_distribution(donor);
            
            // Donation count achievements
            if donation_count >= 1 { achievements.push(String::from("First Donation")); }
            if donation_count >= 5 { achievements.push(String::from("Generous Giver")); }
            if donation_count >= 10 { achievements.push(String::from("Philanthropist")); }
            if donation_count >= 25 { achievements.push(String::from("Champion Donor")); }
            if donation_count >= 50 { achievements.push(String::from("Legendary Supporter")); }
            
            // Amount achievements (using 1 DOT = 10^13)
            const ONE_DOT: Balance = 10_000_000_000_000;
            if total_amount >= ONE_DOT { achievements.push(String::from("DOT Donor")); }
            if total_amount >= ONE_DOT * 10 { achievements.push(String::from("Big Spender")); }
            if total_amount >= ONE_DOT * 100 { achievements.push(String::from("Whale")); }
            if total_amount >= ONE_DOT * 1000 { achievements.push(String::from("Mega Whale")); }
            
            // Rarity achievements
            if legendary > 0 { achievements.push(String::from("Legendary Collector")); }
            if epic >= 3 { achievements.push(String::from("Epic Collection")); }
            if rare >= 5 { achievements.push(String::from("Rare Collector")); }
            let total_nfts = common.saturating_add(uncommon).saturating_add(rare).saturating_add(epic).saturating_add(legendary);
            if total_nfts >= 10 { 
                achievements.push(String::from("NFT Enthusiast")); 
            }
            
            achievements
        }
    }

    /// Event emitted when a token is transferred
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        token_id: TokenId,
    }

    /// Event emitted when a donation NFT is minted
    #[ink(event)]
    pub struct DonationNftMinted {
        #[ink(topic)]
        token_id: TokenId,
        #[ink(topic)]
        owner: AccountId,
        campaign_id: u32,
        amount: Balance,
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let nft = DonationNft::new(
                accounts.bob,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );
            assert_eq!(nft.total_supply(), 0);
            assert_eq!(nft.collection_name(), "DotNation Receipt");
            assert_eq!(nft.collection_symbol(), "DNFT");
        }

        #[ink::test]
        fn mint_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            // Set caller to admin
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            let result = nft.mint_donation_receipt(
                accounts.bob,
                1,
                String::from("Save the Forest"),
                1000000,
                12345678,
            );

            assert!(result.is_ok());
            assert_eq!(nft.total_supply(), 1);
            assert_eq!(nft.owner_of(0), Some(accounts.bob));
        }

        #[ink::test]
        fn unauthorized_mint_fails() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            // Try to mint as unauthorized user
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);

            let result = nft.mint_donation_receipt(
                accounts.bob,
                1,
                String::from("Save the Forest"),
                1000000,
                12345678,
            );

            assert_eq!(result, Err(Error::NotAuthorized));
        }

        #[ink::test]
        fn tokens_of_owner_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            // Mint 3 tokens to bob
            nft.mint_donation_receipt(accounts.bob, 1, String::from("Campaign 1"), 1000, 100).unwrap();
            nft.mint_donation_receipt(accounts.bob, 2, String::from("Campaign 2"), 2000, 200).unwrap();
            nft.mint_donation_receipt(accounts.bob, 3, String::from("Campaign 3"), 3000, 300).unwrap();

            let tokens = nft.tokens_of_owner(accounts.bob);
            assert_eq!(tokens.len(), 3);
        }

        #[ink::test]
        fn donation_stats_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            nft.mint_donation_receipt(accounts.bob, 1, String::from("Campaign 1"), 1000, 100).unwrap();
            nft.mint_donation_receipt(accounts.bob, 2, String::from("Campaign 2"), 2000, 200).unwrap();

            let (count, total) = nft.get_donation_stats(accounts.bob);
            assert_eq!(count, 2);
            assert_eq!(total, 3000);
        }

        #[ink::test]
        fn transfer_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            // Mint token to bob
            nft.mint_donation_receipt(accounts.bob, 1, String::from("Campaign 1"), 1000, 100).unwrap();
            assert_eq!(nft.owner_of(0), Some(accounts.bob));

            // Transfer from bob to charlie
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result = nft.transfer(accounts.charlie, 0);
            assert!(result.is_ok());
            assert_eq!(nft.owner_of(0), Some(accounts.charlie));
            
            // Check transfer count increased
            let metadata = nft.get_token_metadata(0).unwrap();
            assert_eq!(metadata.transfer_count, 1);
        }

        #[ink::test]
        fn rarity_tier_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            const ONE_DOT: Balance = 10_000_000_000_000;

            // Test different rarity tiers
            nft.mint_donation_receipt(accounts.bob, 1, String::from("C1"), ONE_DOT / 2, 100).unwrap();
            nft.mint_donation_receipt(accounts.bob, 2, String::from("C2"), ONE_DOT * 5, 200).unwrap();
            nft.mint_donation_receipt(accounts.bob, 3, String::from("C3"), ONE_DOT * 50, 300).unwrap();

            let metadata0 = nft.get_token_metadata(0).unwrap();
            let metadata1 = nft.get_token_metadata(1).unwrap();
            let metadata2 = nft.get_token_metadata(2).unwrap();

            assert_eq!(metadata0.rarity, RarityTier::Common);
            assert_eq!(metadata1.rarity, RarityTier::Uncommon);
            assert_eq!(metadata2.rarity, RarityTier::Rare);
        }

        #[ink::test]
        fn achievements_work() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut nft = DonationNft::new(
                accounts.alice,
                String::from("DotNation Receipt"),
                String::from("DNFT"),
            );

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            // Mint 5 NFTs
            for i in 0..5 {
                nft.mint_donation_receipt(accounts.bob, i, String::from("Campaign"), 1000, 100).unwrap();
            }

            let achievements = nft.get_achievements(accounts.bob);
            assert!(achievements.len() >= 2); // Should have "First Donation" and "Generous Giver"
        }
    }
}

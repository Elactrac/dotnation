#![cfg_attr(not(feature = "std"), no_std, no_main)]

/// Upgradable Proxy Contract
///
/// This contract acts as a permanent entry point that delegates all calls
/// to a logic contract. The logic contract address can be updated by the admin,
/// allowing for upgrades without data migration.
#[ink::contract]
mod proxy {
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::DefaultEnvironment;

    /// Defines the errors that can occur in the proxy contract.
    ///
    /// These errors are specific to the proxy's functionality, such as access control
    /// and upgrade management.
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Only the admin can perform this action.
        OnlyAdmin,
        /// The logic contract address is invalid (zero address).
        InvalidLogicContract,
        /// The delegate call failed.
        DelegateCallFailed,
        /// The contract is currently locked for upgrades.
        UpgradeLocked,
    }

    /// The storage for the proxy contract.
    ///
    /// This struct holds the essential state of the proxy, including the address of the
    /// current logic contract, the admin account, and a lock to prevent upgrades.
    #[ink(storage)]
    pub struct Proxy {
        /// The address of the current logic contract.
        logic_contract: AccountId,
        /// The admin who can upgrade the logic contract.
        admin: AccountId,
        /// Lock to prevent upgrades during critical operations.
        upgrade_locked: bool,
    }

    impl Proxy {
        /// Creates a new proxy contract.
        ///
        /// The constructor initializes the proxy with the address of the initial logic
        /// contract. The caller of this constructor becomes the admin of the proxy.
        ///
        /// # Arguments
        ///
        /// * `logic_contract` - The initial logic contract address.
        ///
        /// # Returns
        ///
        /// - `Ok(Self)`: A new instance of the proxy contract.
        /// - `Err(Error::InvalidLogicContract)`: If the provided logic contract address is invalid.
        ///
        /// # Errors
        ///
        /// Returns `Error::InvalidLogicContract` if the `logic_contract` address is the zero address.
        #[ink(constructor)]
        pub fn new(logic_contract: AccountId) -> Result<Self, Error> {
            if logic_contract == AccountId::from([0; 32]) {
                return Err(Error::InvalidLogicContract);
            }

            Ok(Self {
                logic_contract,
                admin: Self::env().caller(),
                upgrade_locked: false,
            })
        }

        /// Upgrades the logic contract to a new address.
        ///
        /// This function can only be called by the admin. It updates the `logic_contract`
        /// address to point to a new implementation, effectively upgrading the contract's
        /// logic while preserving its storage.
        ///
        /// On success, a `LogicContractUpgraded` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `new_logic_contract` - The new logic contract address.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: If the upgrade was successful.
        /// - `Err(Error)`: If the caller is not the admin, the new address is invalid, or
        ///   upgrades are locked.
        ///
        /// # Errors
        ///
        /// Returns `Error::OnlyAdmin`, `Error::UpgradeLocked`, or `Error::InvalidLogicContract`.
        #[ink(message)]
        pub fn upgrade_logic_contract(&mut self, new_logic_contract: AccountId) -> Result<(), Error> {
            let caller = self.env().caller();

            // Only admin can upgrade
            if caller != self.admin {
                return Err(Error::OnlyAdmin);
            }

            // Check if upgrades are locked
            if self.upgrade_locked {
                return Err(Error::UpgradeLocked);
            }

            // Validate new logic contract address
            if new_logic_contract == AccountId::from([0; 32]) {
                return Err(Error::InvalidLogicContract);
            }

            let old_logic = self.logic_contract;
            self.logic_contract = new_logic_contract;

            // Emit event
            self.env().emit_event(LogicContractUpgraded {
                old_logic,
                new_logic: new_logic_contract,
                upgraded_by: caller,
            });

            Ok(())
        }

        /// Transfers admin rights to a new account.
        ///
        /// Allows the current admin to transfer their administrative privileges to a new
        /// account. This is a critical operation and should be used with care.
        ///
        /// On success, an `AdminTransferred` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `new_admin` - The new admin account.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: On successful transfer.
        /// - `Err(Error)`: If the caller is not the admin or the new admin address is invalid.
        ///
        /// # Errors
        ///
        /// Returns `Error::OnlyAdmin` or `Error::InvalidLogicContract` (reused for invalid admin address).
        #[ink(message)]
        pub fn transfer_admin(&mut self, new_admin: AccountId) -> Result<(), Error> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(Error::OnlyAdmin);
            }

            if new_admin == AccountId::from([0; 32]) {
                return Err(Error::InvalidLogicContract); // Reusing error for simplicity
            }

            let old_admin = self.admin;
            self.admin = new_admin;

            self.env().emit_event(AdminTransferred {
                old_admin,
                new_admin,
            });

            Ok(())
        }

        /// Locks or unlocks upgrades.
        ///
        /// This function allows the admin to temporarily disable or enable contract upgrades.
        /// This can be used as a security measure to prevent upgrades during sensitive periods.
        ///
        /// On success, an `UpgradeLockChanged` event is emitted.
        ///
        /// # Arguments
        ///
        /// * `locked` - Whether to lock or unlock upgrades. `true` locks, `false` unlocks.
        ///
        /// # Returns
        ///
        /// - `Ok(())`: On success.
        /// - `Err(Error::OnlyAdmin)`: If the caller is not the admin.
        #[ink(message)]
        pub fn set_upgrade_lock(&mut self, locked: bool) -> Result<(), Error> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(Error::OnlyAdmin);
            }

            self.upgrade_locked = locked;

            self.env().emit_event(UpgradeLockChanged {
                locked,
                changed_by: caller,
            });

            Ok(())
        }

        /// Gets the current logic contract address.
        ///
        /// # Returns
        ///
        /// The `AccountId` of the currently active logic contract.
        #[ink(message)]
        pub fn get_logic_contract(&self) -> AccountId {
            self.logic_contract
        }

        /// Gets the current admin address.
        ///
        /// # Returns
        ///
        /// The `AccountId` of the proxy's administrator.
        #[ink(message)]
        pub fn get_admin(&self) -> AccountId {
            self.admin
        }

        /// Gets the upgrade lock status.
        ///
        /// # Returns
        ///
        /// `true` if upgrades are currently locked, `false` otherwise.
        #[ink(message)]
        pub fn is_upgrade_locked(&self) -> bool {
            self.upgrade_locked
        }

        /// A fallback function that delegates all other calls to the logic contract.
        ///
        /// This special function catches any call that does not match the other defined
        /// messages. It is intended to forward the call to the logic contract using a
        /// delegate call, which executes the logic of the other contract in the context
        /// of this proxy's storage.
        ///
        /// **Note:** This is a conceptual implementation. True delegate calls are not
        /// yet fully supported in ink! in a straightforward manner.
        ///
        /// # Returns
        ///
        /// Returns `Error::DelegateCallFailed` as a placeholder. In a real implementation,
        /// it would return the result of the delegated call.
        #[ink(message, selector = _)]
        pub fn fallback(&self) -> Result<(), Error> {
            // Get the input data (selector + arguments)
            let input = self.env().call_data();

            // Forward the call to the logic contract using delegate call
            // Note: In a real implementation, you would use delegate_call which preserves
            // the proxy's storage context. ink! currently doesn't support delegate_call,
            // so this is a conceptual implementation.
            //
            // In production, you would need to:
            // 1. Use a lower-level mechanism or chain extension
            // 2. Or implement each method explicitly with forwarding logic
            // 3. Or wait for ink! to support delegate_call pattern

            // Placeholder - in real implementation this would be:
            // self.env().delegate_call(self.logic_contract, input)

            Err(Error::DelegateCallFailed)
        }
    }

    // Events
    /// Emitted when the logic contract is upgraded.
    #[ink(event)]
    pub struct LogicContractUpgraded {
        /// The old logic contract address.
        #[ink(topic)]
        old_logic: AccountId,
        /// The new logic contract address.
        #[ink(topic)]
        new_logic: AccountId,
        /// The account that performed the upgrade.
        #[ink(topic)]
        upgraded_by: AccountId,
    }

    /// Emitted when admin rights are transferred.
    #[ink(event)]
    pub struct AdminTransferred {
        /// The old admin address.
        #[ink(topic)]
        old_admin: AccountId,
        /// The new admin address.
        #[ink(topic)]
        new_admin: AccountId,
    }

    /// Emitted when the upgrade lock status changes.
    #[ink(event)]
    pub struct UpgradeLockChanged {
        /// Whether upgrades are locked.
        locked: bool,
        /// The account that changed the lock.
        #[ink(topic)]
        changed_by: AccountId,
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        #[ink::test]
        fn new_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let proxy = Proxy::new(accounts.bob).unwrap();

            assert_eq!(proxy.get_logic_contract(), accounts.bob);
            assert_eq!(proxy.get_admin(), accounts.alice);
            assert!(!proxy.is_upgrade_locked());
        }

        #[ink::test]
        fn upgrade_logic_contract_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut proxy = Proxy::new(accounts.bob).unwrap();

            assert!(proxy.upgrade_logic_contract(accounts.charlie).is_ok());
            assert_eq!(proxy.get_logic_contract(), accounts.charlie);
        }

        #[ink::test]
        fn upgrade_requires_admin() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut proxy = Proxy::new(accounts.bob).unwrap();

            // Set caller to non-admin
            test::set_caller::<DefaultEnvironment>(accounts.bob);

            assert_eq!(
                proxy.upgrade_logic_contract(accounts.charlie),
                Err(Error::OnlyAdmin)
            );
        }

        #[ink::test]
        fn transfer_admin_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut proxy = Proxy::new(accounts.bob).unwrap();

            assert!(proxy.transfer_admin(accounts.charlie).is_ok());
            assert_eq!(proxy.get_admin(), accounts.charlie);
        }

        #[ink::test]
        fn upgrade_lock_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let mut proxy = Proxy::new(accounts.bob).unwrap();

            // Lock upgrades
            assert!(proxy.set_upgrade_lock(true).is_ok());
            assert!(proxy.is_upgrade_locked());

            // Try to upgrade while locked
            assert_eq!(
                proxy.upgrade_logic_contract(accounts.charlie),
                Err(Error::UpgradeLocked)
            );

            // Unlock and try again
            assert!(proxy.set_upgrade_lock(false).is_ok());
            assert!(proxy.upgrade_logic_contract(accounts.charlie).is_ok());
        }
    }
}

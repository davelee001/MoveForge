module Subscription {
    use std::signer;
    use std::vector;
    use std::option;
    use std::error;
    use std::timestamp;
    use std::address;

    /// Error codes
    const ENOT_SUBSCRIBED: u64 = 1;
    const EALREADY_SUBSCRIBED: u64 = 2;
    const ENOT_EXPIRED: u64 = 3;

    /// Subscription duration (e.g., 30 days in seconds)
    const DURATION: u64 = 30 * 24 * 60 * 60;

    /// Resource to track a user's subscription
    struct UserSubscription has key {
        expires_at: u64,
    }

    /// Publish a subscription for the sender
    public entry fun subscribe(account: &signer) {
        let addr = signer::address_of(account);
        if (exists<UserSubscription>(addr)) {
            abort EALREADY_SUBSCRIBED;
        }
        let now = timestamp::now_seconds();
        move_to(account, UserSubscription { expires_at: now + DURATION });
    }

    /// Renew an existing subscription
    public entry fun renew(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<UserSubscription>(addr)) {
            abort ENOT_SUBSCRIBED;
        }
        let mut sub = borrow_global_mut<UserSubscription>(addr);
        let now = timestamp::now_seconds();
        if (sub.expires_at > now) {
            abort ENOT_EXPIRED;
        }
        sub.expires_at = now + DURATION;
    }

    /// Check if a user is subscribed
    public fun is_subscribed(addr: address): bool {
        if (!exists<UserSubscription>(addr)) {
            return false;
        }
        let sub = borrow_global<UserSubscription>(addr);
        let now = timestamp::now_seconds();
        sub.expires_at > now
    }

    /// Get subscription expiration timestamp
    public fun get_expiry(addr: address): option::Option<u64> {
        if (!exists<UserSubscription>(addr)) {
            return option::none<u64>();
        }
        let sub = borrow_global<UserSubscription>(addr);
        option::some(sub.expires_at)
    }
}

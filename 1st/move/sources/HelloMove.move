module _1st::hello_move {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event;

    /// Resource that stores a greeting message
    struct Greeting has key {
        message: String,
        counter: u64,
    }

    /// Event emitted when greeting is updated
    struct GreetingEvent has drop, store {
        message: String,
        counter: u64,
    }

    /// Initialize the module with a default greeting
    public entry fun initialize(account: &signer) {
        let greeting = Greeting {
            message: string::utf8(b"Hello, Movement Network!"),
            counter: 0,
        };
        move_to(account, greeting);
    }

    /// Update the greeting message
    public entry fun set_greeting(account: &signer, new_message: String) acquires Greeting {
        let account_addr = signer::address_of(account);
        let greeting = borrow_global_mut<Greeting>(account_addr);
        greeting.message = new_message;
        greeting.counter = greeting.counter + 1;

        // Emit event
        event::emit(GreetingEvent {
            message: new_message,
            counter: greeting.counter,
        });
    }

    /// Get the current greeting message
    #[view]
    public fun get_greeting(account_addr: address): (String, u64) acquires Greeting {
        let greeting = borrow_global<Greeting>(account_addr);
        (greeting.message, greeting.counter)
    }

    #[test(account = @_1st)]
    public fun test_greeting(account: &signer) acquires Greeting {
        initialize(account);
        let addr = signer::address_of(account);
        let (message, counter) = get_greeting(addr);
        assert!(counter == 0, 0);
        
        set_greeting(account, string::utf8(b"Hello, MoveForge!"));
        let (new_message, new_counter) = get_greeting(addr);
        assert!(new_counter == 1, 1);
    }
}

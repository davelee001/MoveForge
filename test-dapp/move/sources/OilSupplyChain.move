module test_dapp::oil_supply_chain {
    use std::string::{Self, String};
    use std::signer;
    use aptos_framework::event;

    /// Event: drilling started for a batch
    struct DrillingStartedEvent has drop, store {
        batch_id: String,
        location: String,
        quantity: u64,
        unit: String,
    }

    /// Event: drilling completed for a batch
    struct DrillingCompletedEvent has drop, store {
        batch_id: String,
        location: String,
    }

    /// Event: transportation of a batch between points
    struct TransportationEvent has drop, store {
        batch_id: String,
        from: String,
        to: String,
        method: String,
    }

    /// Event: refining of a batch
    struct RefiningEvent has drop, store {
        batch_id: String,
        refinery: String,
        output_quantity: u64,
        unit: String,
    }

    /// Event: final delivery/consumption of a batch
    struct DeliveryEvent has drop, store {
        batch_id: String,
        destination: String,
    }

    /// Start drilling for a given oil batch
    public entry fun start_drilling(account: &signer, batch_id: String, location: String, quantity: u64, unit: String) {
        // Emit drilling started
        event::emit(DrillingStartedEvent { batch_id, location, quantity, unit });
    }

    /// Complete drilling phase
    public entry fun complete_drilling(account: &signer, batch_id: String, location: String) {
        event::emit(DrillingCompletedEvent { batch_id, location });
    }

    /// Record transportation step
    public entry fun transport(account: &signer, batch_id: String, from: String, to: String, method: String) {
        event::emit(TransportationEvent { batch_id, from, to, method });
    }

    /// Record refining step
    public entry fun refine(account: &signer, batch_id: String, refinery: String, output_quantity: u64, unit: String) {
        event::emit(RefiningEvent { batch_id, refinery, output_quantity, unit });
    }

    /// Record final delivery step
    public entry fun deliver(account: &signer, batch_id: String, destination: String) {
        event::emit(DeliveryEvent { batch_id, destination });
    }
}

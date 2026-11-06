// Print the tunables of this crate's own bot engine configuration, for comparison with the CLI's.
use wasmtime::*;
fn main() {
    let mut cfg = Config::new();
    cfg.consume_fuel(true);
    cfg.wasm_exceptions(true);
    cfg.max_wasm_stack(4 << 20);
    cfg.async_stack_size(64 << 20);
    let engine = Engine::new(&cfg).unwrap();
    let m = Module::new(&engine, b"\0asm\x01\0\0\0").unwrap();
    std::fs::write(std::env::args().nth(1).unwrap(), m.serialize().unwrap()).unwrap();
}

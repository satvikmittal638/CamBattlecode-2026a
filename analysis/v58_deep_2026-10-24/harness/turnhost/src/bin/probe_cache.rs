// Extract the fuel operator-cost table from a module compiled and cached by the official CLI
// (CAMBC_WASMTIME_CACHE=<dir> cambc run ...; zstd -d <cache entry>), and save it for turnhost.
//   probe_cache <cli.cwasm> [out.postcard]
use object::{Object, ObjectSection};
use serde::Deserialize;
use wasmtime_environ::{FlagValue, OperatorCostStrategy, Tunables};

#[derive(Deserialize)]
struct Meta<'a> {
    target: String,
    #[serde(borrow)]
    shared_flags: Vec<(&'a str, FlagValue<'a>)>,
    #[serde(borrow)]
    isa_flags: Vec<(&'a str, FlagValue<'a>)>,
    tunables: Tunables,
    features: u64,
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let bytes = std::fs::read(&args[1]).unwrap();
    let obj = object::File::parse(&*bytes).unwrap();
    let sec = obj.section_by_name(".wasmtime.engine").expect("engine section");
    let data = sec.data().unwrap();
    let vlen = data[1] as usize;
    let version = std::str::from_utf8(&data[2..2 + vlen]).unwrap();
    let meta: Meta = postcard::from_bytes(&data[2 + vlen..]).unwrap();
    println!("version {version} target {} features {:#x}", meta.target, meta.features);
    println!("shared flags {}", meta.shared_flags.len());
    println!("isa flags {}", meta.isa_flags.len());
    let t = &meta.tunables;
    println!("consume_fuel {} epoch {}", t.consume_fuel, t.epoch_interruption);
    let full = format!("{t:?}");
    let cut = full.find("operator_cost").unwrap_or(full.len());
    println!("tunables: {}", &full[..cut]);
    match &t.operator_cost {
        OperatorCostStrategy::Default => println!("operator costs: default"),
        OperatorCostStrategy::Table(c) => {
            let s = format!("{c:?}");
            // Print only the non-default entries.
            let body = s.trim_start_matches("OperatorCost {").trim_end_matches('}');
            let mut odd = vec![];
            for kv in body.split(", ") {
                if let Some((k, v)) = kv.split_once(": ") {
                    if v != "1" { odd.push(format!("{k}={v}")); }
                }
            }
            println!("operator cost table, entries != 1: {}", odd.join(" "));
            println!("variable: {:?}", c.variable);
            if let Some(out) = args.get(2) {
                std::fs::write(out, postcard::to_allocvec(c.as_ref()).unwrap()).unwrap();
                println!("saved {out}");
            }
        }
    }
}

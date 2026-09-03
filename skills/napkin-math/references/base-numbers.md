# Base numbers

Use these rounded values for order-of-magnitude estimates. They are adapted from [`sirupsen/napkin-math`](https://github.com/sirupsen/napkin-math) at commit [`aae5832`](https://github.com/sirupsen/napkin-math/commit/aae5832fc5d7c6881b7a78f756e8863ec86c428b), whose measured rows were revalidated on March 8, 2026 using a GCP `c4-standard-48-lssd` instance (Intel Xeon 6985P-C, 48 vCPU / 24 physical cores, 180 GB RAM, Ubuntu 22.04.5 LTS).

The source rounds for memorability rather than precision. Its latency and throughput columns intentionally do not always agree. Choose the column matching the target metric rather than deriving one column from another.

| Operation | Latency | Throughput | 1 MiB | 1 GiB |
| --- | ---: | ---: | ---: | ---: |
| Sequential memory R/W, 64 bytes | 0.5 ns | | | |
| ├ Single thread | | 20 GiB/s | 50 μs | 50 ms |
| ├ Threaded | | 200 GiB/s | 5 μs | 5 ms |
| Network, same zone | | 10 GiB/s | 100 μs | 100 ms |
| ├ Inside VPC | | 10 GiB/s | 100 μs | 100 ms |
| ├ Outside VPC | | 3 GiB/s | 300 μs | 300 ms |
| Hashing, not crypto-safe, 64 bytes | 10 ns | 5 GiB/s | 200 μs | 200 ms |
| Random memory R/W, 64 bytes | 20 ns | 3 GiB/s | 300 μs | 300 ms |
| Fast serialization | N/A | 1 GiB/s | 1 ms | 1 s |
| Fast deserialization | N/A | 1 GiB/s | 1 ms | 1 s |
| System call | 300 ns | N/A | N/A | N/A |
| Hashing, crypto-safe, 64 bytes | 100 ns | 1 GiB/s | 1 ms | 1 s |
| Sequential SSD read, 8 KiB | 1 μs | 8 GiB/s | 100 μs | 100 ms |
| Context switch | 10 μs | N/A | N/A | N/A |
| Sequential SSD write without fsync, 8 KiB | 2 μs | 3 GiB/s | 300 μs | 300 ms |
| TCP echo server, 32 KiB | 50 μs | 500 MiB/s | 2 ms | 2 s |
| Random SSD read, 8 KiB | 100 μs | 70 MiB/s | 15 ms | 15 s |
| Decompression | N/A | 1 GiB/s | 1 ms | 1 s |
| Compression | N/A | 500 MiB/s | 2 ms | 2 s |
| Sorting 64-bit integers | N/A | 500 MiB/s | 2 ms | 2 s |
| Proxy: Envoy, ProxySQL, Nginx, or HAProxy | 50 μs | Unknown | Unknown | Unknown |
| Network within same region | 250 μs | 2 GiB/s | 500 μs | 500 ms |
| Premium network within zone/VPC | 250 μs | 25 GiB/s | 50 μs | 40 ms |
| Sequential SSD write with fsync, 8 KiB | 300 μs | 30 MiB/s | 30 ms | 30 s |
| MySQL, Memcached, Redis, or similar query | 500 μs | Unknown | Unknown | Unknown |
| Serialization, such as JSON | N/A | 100 MiB/s | 10 ms | 10 s |
| Deserialization, such as JSON | N/A | 100 MiB/s | 10 ms | 10 s |
| Sequential HDD read, 8 KiB | 10 ms | 250 MiB/s | 2 ms | 2 s |
| Random HDD read, 8 KiB | 10 ms | 0.7 MiB/s | 2 s | 30 min |
| Blob storage GET, `If-None-Match` returning 304 | 30 ms | | | |
| Blob storage GET, one connection, 128 KiB | 80 ms | 100 MiB/s | 10 ms | 10 s |
| Blob storage GET, concurrent offset reads | 80 ms | Network limit | | |
| Blob storage LIST | 100 ms | | | |
| Blob storage PUT, one connection, 128 KiB | 200 ms | 100 MiB/s | 10 ms | 10 s |
| Blob storage PUT, concurrent multipart | 200 ms | Network limit | 10 ms | 10 s |
| Network between regions, generic | Varies | 25 MiB/s | 40 ms | 40 s |
| ├ North America central ↔ east | 25 ms | 25 MiB/s | 40 ms | 40 s |
| ├ North America central ↔ west | 40 ms | 25 MiB/s | 40 ms | 40 s |
| ├ North America east ↔ west | 60 ms | 25 MiB/s | 40 ms | 40 s |
| ├ EU west ↔ North America east | 80 ms | 25 MiB/s | 40 ms | 40 s |
| ├ EU west ↔ North America central | 100 ms | 25 MiB/s | 40 ms | 40 s |
| ├ North America west ↔ Singapore | 180 ms | 25 MiB/s | 40 ms | 40 s |
| └ EU west ↔ Singapore | 160 ms | 25 MiB/s | 40 ms | 40 s |

## Interpretation

- “Fast serialization” means a simple wire protocol or unusually efficient implementation. Use the ordinary serialization rows for JSON-like work.
- A transfer generally pays startup latency plus `bytes / throughput` when both costs are irreducible. For steady-state streams, throughput can be the relevant bound by itself.
- A bandwidth labelled “network limit” needs an explicit network row and a script-level `min(...)` across storage, host, and network limits.
- Binary data units are `KiB = 2^10 bytes`, `MiB = 2^20 bytes`, and `GiB = 2^30 bytes`. Decimal network or vendor units may differ; encode the chosen convention in the script.
- These values describe an optimistic reference machine, not a production guarantee. Prefer current workload-specific measurements when supplied.

Adapted from *Napkin Math* by Simon Eskildsen, Copyright © 2019, under the [MIT License](https://github.com/sirupsen/napkin-math/blob/aae5832fc5d7c6881b7a78f756e8863ec86c428b/LICENSE).

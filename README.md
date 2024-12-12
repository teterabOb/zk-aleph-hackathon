# Implementación ZKP - BeTrusty - Aleph Hackathon

## Descripción

Este repositorio contiene los circuitos e una implementación básica para la generación de pruebas 

## Comandos

```shell
circom balance.circom --r1cs --wasm --sym --c
```

```shell
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

```shell
snarkjs groth16 setup balance.r1cs pot12_final.ptau balance_0000.zkey
```

## Contrato

| **Contrato**       | **Dirección**                                    |
|----------------|----------------------------------------------|
| `verifier.sol`      | `0x1b8f823ed41Bd01851B6f9Fcc1D66517458885B5`   |

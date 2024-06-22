# How to generate abi?

- Download the 0xprotocol repo from `https://github.com/0xProject/protocol/tree/main`
- Edit all Transformer contracts inside zeroex with the following function as required.
- **It is important to name the function `abiDecodeStruct`**
- Compile contracts with `yarn build:contracts`
- remove all extra data from the compiled json and keep only the abi. Can also remove extra data from abi.

## Function to add `abiDecodeStruct`

```
 function abiDecodeStruct(TransformData calldata data) external pure {}
 function abiDecodeStruct(TokenFee[] calldata data) public pure {}
```
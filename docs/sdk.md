# Albus SDK v.0.2.12

## JavaScript integration

First of all, install the `albus-sdk`.
<sup>*SDK version may vary</sup>

### Install from the command line:
```toml
npm install @mfactory-lab/albus-sdk@0.2.12
```
### Install via package.json:
 ```toml
"@mfactory-lab/albus-sdk": "0.2.12"
```

#### Init client
```javascript
const client = AlbusClient.factory("connection", "wallet")
```
#### Work with services

Get all services
```javascript
const services = await client.service.find()
```
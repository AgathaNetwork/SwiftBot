# 使用Key的API


## 1. 通过Key创建Bot

- **URL**: `/key/createBot/:key`
- **Method**: `POST`
- **参数**:
  - `ip` (string): Bot的服务器IP
  - `port` (number): Bot的服务器端口
  - `version` (string): Minecraft版本
  - `username` (string): Bot的用户名
- **返回值**:
  ```json
  {
    "message": "string", // 成功消息
    "bot": {
      "username": "string", // Bot的用户名
      "ip": "string", // Bot的服务器IP
      "port": "number", // Bot的服务器端口
      "version": "string", // Minecraft版本
      "uuid": "string" // Bot的UUID
    }
  }
  ```
- **说明**: 使用指定的Key创建一个新的Bot。

## 2. 通过Key删除Bot

- **URL**: `/key/deleteBot/:key/:uuid`
- **Method**: `DELETE`
- **参数**:
  - `uuid` (string): 要删除的Bot的UUID
- **返回值**:
  ```json
  {
    "message": "string" // 成功消息
  }
  ```
- **说明**: 使用指定的Key删除指定的Bot。

## 3. 通过Key和Name获取Bot信息

- **URL**: `/key/getBotByName/:key/:name`
- **Method**: `GET`
- **参数**:
  - `name` (string): Bot的用户名
- **返回值**:
  ```json
  {
    "username": "string", // Bot的用户名
    "ip": "string", // Bot的服务器IP，如果不存在则返回"Unknown"
    "port": "number", // Bot的服务器端口，如果不存在则返回"Unknown"
    "version": "string", // Minecraft版本
    "uuid": "string" // Bot的UUID
  }
  ```
- **说明**: 使用指定的Key和用户名获取Bot的信息。

## 4. 通过Key和UUID获取Bot信息

- **URL**: `/key/getBotByUuid/:key/:uuid`
- **Method**: `GET`
- **参数**:
  - `uuid` (string): Bot的UUID
- **返回值**:
  ```json
  {
    "username": "string", // Bot的用户名
    "ip": "string", // Bot的服务器IP，如果不存在则返回"Unknown"
    "port": "number", // Bot的服务器端口，如果不存在则返回"Unknown"
    "version": "string", // Minecraft版本
    "uuid": "string" // Bot的UUID
  }
  ```
- **说明**: 使用指定的Key和UUID获取Bot的信息。

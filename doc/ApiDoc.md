# 使用Key的API


## 1. 创建新的Key

- **URL**: `/api/createKey`
- **Method**: `POST`
- **参数**:
  - `sessionId` (string): 用户的会话ID，通过Cookie获取
- **返回值**:
  ```json
  {
    "key": "string", // 生成的Key
    "time": "string" // 创建时间，ISO格式
  }

- **说明**: 使用用户的会话ID创建一个新的Key。

## 2. 删除Key

- **URL**: `/api/deleteKey/:key`
- **Method**: `DELETE`
- **参数**:
  - `key` (string): 要删除的Key
- **返回值**:
  ```json
  {
    "success": true
  }
  ```
- **说明**: 删除指定的Key。

## 3. 列出所有Key

- **URL**: `/api/listKeys`
- **Method**: `GET`
- **参数**:
  - `sessionId` (string): 用户的会话ID，通过查询参数传递
- **返回值**:
  ```json
  [
    {
      "key": "string", // Key值
      "time": "string" // 创建时间，ISO格式
    },
    ...
  ]
  ```
- **说明**: 列出所有可用的Key。

## 4. 通过Key创建Bot

- **URL**: `/key/createBot/:key`
- **Method**: `POST`
- **参数**:
  - `key` (string): 验证用的Key
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

## 5. 通过Key删除Bot

- **URL**: `/key/deleteBot/:key/:uuid`
- **Method**: `DELETE`
- **参数**:
  - `key` (string): 验证用的Key
  - `uuid` (string): 要删除的Bot的UUID
- **返回值**:
  ```json
  {
    "message": "string" // 成功消息
  }
  ```
- **说明**: 使用指定的Key删除指定的Bot。

## 6. 通过Key和Name获取Bot信息

- **URL**: `/key/getBotByName/:key/:name`
- **Method**: `GET`
- **参数**:
  - `key` (string): 验证用的Key
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

## 7. 通过Key和UUID获取Bot信息

- **URL**: `/key/getBotByUuid/:key/:uuid`
- **Method**: `GET`
- **参数**:
  - `key` (string): 验证用的Key
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

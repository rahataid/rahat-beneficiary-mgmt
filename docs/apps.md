#### APP CLIENT

To use app sdk client we need retrive from the SDK using `rumsanService.client`

```
const appStatsClient = getAppClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### Get app status

```
appStatsClient.getAppStatus
```

| Parameter  | Type     | Description           |
| :--------- | :------- | :-------------------- |
| `location` | `string` | filter by location    |
| `ward_no`  | `string` | filter by ward number |

```
    success: true
    data:[]
```

- #### Post import kobo-tool form

```
appStatsClient.koboImportByForm
```

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `name`    | `string` | name of the kobo tool |

- #### Get Kobo tools Settings

```
appStatsClient.listKoboSettings
```

- #### Get app settings by name

```
appStatsClient.listBySettingName
```

| Parameter | Type     | Description             |
| :-------- | :------- | :---------------------- |
| `name`    | `string` | name of the app setting |

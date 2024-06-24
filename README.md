# Community-tool

The Community Tool is designed to facilitate efficient management of beneficiary data, ensuring accuracy, reliability, and secure handling of non-PII (Personally Identifiable Information) data. It enables targeting beneficiaries based on geographical, social, economic, and physical indicators.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
PORT=5505
PORT_BEN=5501
PRIVATE_KEY=FILL_WITH_YOUR_PRIVATE_KEY
KOBO_URL= FILL_WITH_YOUR_KOBO_TOOL_URL
AUTH_TOKEN=FILL_WITH_YOUR_AUTH_TOKEN
```

JWT setup

```
JWT_SECRET_KEY=FILL_WITH_YOUR_SECRET_KEY
JWT_EXPIRATION_TIME=604800000
JWT_EXPIRATION_LONG_TIME=604800000
```

OTP time duration

```
OTP_DURATION_IN_SECS=300

```

Redis setup

```
REDIS_HOST= FILL_WITH_YOUR_REDIS_HOST
REDIS_PORT= FILL_WITH_YOUR_REDIS_PORT
REDIS_PASSWORD=FILL_WITH_YOUR_REDIS_PASSSWORD
```

Nest run in docker, change host to database container name

```
DB_HOST=FILL_WITH_YOUR_DB_HOST
DB_PORT=5432
DB_USERNAME= FILL_WITH_YOUR_USERNAME
DB_PASSWORD=FILL_WITH_YOUR_PASSWORD
DB_NAME= FILL_WITH_YOUR_DB_NAME
```

Prisma database connection

```
DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
```

SMTP setup

```
#Mailing Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME= FILL_WITH_YOUR_USERNAME
SMTP_PASSWORD= FILL_WITH_YOUR_PASSWORD
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/rahataid/rahat-beneficiary-mgmt.git
```

Go to the project directory

```bash
  cd rahat-beneficiary-mgmt
```

Install dependencies

```bash
  pnpm install
```

Prisma migration

```bash
 npx prisma migrate dev
```

Start the server

```bash
  pnpm dev
```

## SDK

### Installation

You can install the SDK via pnpm:

```bash
pnpm install @rahataid/community-tool-sdk
```

You need to install rumsan/react-query package:

```bash
pnpm install @rumsan/react-query
```

### Getting Started

To get started with SDK

- Import client function it in your project from the SDK module you installed :

```
  import { clientName } from '@rahataid/community-tool-sdk/clients'

```

- Import required hook from the `@tanstack/react-query`

```
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
```

- Import hooks **useRSQuery** from the `rumsan/react-query` package :

```
import {  useRSQuery } from '@rumsan/react-query'
```

- Import other hooks, function, types/interface and constants from the varios modules and package as required

- Create a custom hook that uses React Query to fetch the application

- Initialize the service from **useRSQuery** hook

```
  const { queryClient, rumsanService } = useRSQuery();

```

### Client

Below are the sdk client that will be used to connect :

- [getAppClient](docs/apps.md)
- [getSettingsClient](docs/settings.md)
- [getFieldDefinitionClient](docs/fieldDefinition.md)
- [getBeneficiaryClient](docs/beneficiary.md)
- [getGroupClient](docs/group.md)
- [getBeneficiaryGroupClient](docs/beneficiaryGroups.md)
- [getSourceClient](docs/sources.md)
- [getBeneficiarySourcesClient](docs/beneficiarySources.md)
- [getTargetClient](docs/targets.md)

### Example

Let's take an example for the `appClient`

```
import { getAppClient } from '@rahataid/community-tool-sdk/clients';
import { useQuery, useRSQuery } from '@rumsan/react-query';
import { FilterStatsDto } from '@rahataid/community-tool-sdk/app';

export const useAppStatsList = (data?: FilterStatsDto) => {
  // Get queryClient and rumsanService from useRSQuery hook
  const { queryClient, rumsanService } = useRSQuery();

  // Get appStatsClient using getAppClient function from SDK
  const appStatsClient = getAppClient(rumsanService.client);

  // Define query using useQuery hook from react-query
  const query = useQuery(
    {
      queryKey: ["GET_DASHBOARD", data], // Unique key for the query
      queryFn: () => appStatsClient.getAppStats(data), // Function to fetch data
    },
    queryClient, // Provide queryClient instance
  );

  return query; // Return the query object
};

```

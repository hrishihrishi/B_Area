# to run next-frontend
cd next-frontend
npm install 
npm run dev



# to run java backend
cd java-backend
docker compose up -d
./mvnw spring-boot:run




java-backend/src
.
├── main
│   ├── java
│   │   └── com
│   │       └── barea
│   │           ├── JavaBackendApplication.java                     -> entry point of java app
│   │           ├── modules
│   │           │   ├── billing
│   │           │   │   ├── controller
│   │           │   │   ├── domain
│   │           │   │   ├── repository
│   │           │   │   └── service
│   │           │   ├── catalog
│   │           │   │   ├── controller
│   │           │   │   ├── domain
│   │           │   │   ├── repository
│   │           │   │   └── service
│   │           │   ├── chat
│   │           │   │   ├── controller
│   │           │   │   ├── domain
│   │           │   │   ├── repository
│   │           │   │   └── service
│   │           │   ├── company
│   │           │   │   ├── controller
│   │           │   │   │   └── CompanyController.java          -> rest endpoints
│   │           │   │   ├── domain
│   │           │   │   │   └── CompanyProfile.java              -> schema
│   │           │   │   ├── repository
│   │           │   │   │   └── CompanyProfileRepository.java     -> [KNOW MORE]
│   │           │   │   └── service
│   │           │   │       └── CompanyProfileService.java   -> transactions backend<--->db
│   │           │   ├── deal
│   │           │   │   ├── controller
│   │           │   │   ├── domain
│   │           │   │   ├── repository
│   │           │   │   └── service
│   │           │   ├── discovery
│   │           │   │   ├── controller
│   │           │   │   ├── domain
│   │           │   │   └── service
│   │           │   └── identity
│   │           │       ├── controller
│   │           │       ├── domain
│   │           │       ├── repository
│   │           │       └── service
│   │           └── shared
│   │               ├── config
│   │               │   └── SecurityConfig.java              -> configure spring security for apis etc
│   │               ├── domain
│   │               └── security
│   └── resources
│       ├── application.yml
│       ├── db
│       │   └── migration
│       │       └── V1__init_schema.sql
│       ├── static
│       └── templates
└── test
    ├── java
    │   └── com
    │       └── barea
    │           ├── JavaBackendApplicationTests.java
    │           └── modules
    │               └── company
    │                   └── CompanyProfileCrudIntegrationTest.java
    └── resources
        ├── application-test.yml
        └── schema.sql

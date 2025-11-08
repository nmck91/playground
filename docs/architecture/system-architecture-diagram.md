# System Architecture Diagram

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend - Vercel"
        RC[Reward Chart SPA<br/>Angular 20.3<br/>Port 4300]
        FC[Family Calendar SPA<br/>Angular 20.3<br/>Port 4200]
    end

    subgraph "Shared Libraries"
        TW[Tailwind Preset<br/>Design System]
    end

    subgraph "Backend - Supabase"
        DB[(PostgreSQL<br/>Database)]
        AUTH[Auth Service<br/>Not Implemented]
        RT[Real-time<br/>Not Used]
    end

    subgraph "Build & Deploy"
        GHA[GitHub Actions<br/>CI/CD]
        NX[Nx Cloud<br/>Build Cache]
        VERCEL[Vercel<br/>Deployment]
    end

    RC -->|uses| TW
    FC -->|uses| TW
    RC -->|Supabase SDK| DB
    FC -->|Supabase SDK| DB
    FC -->|fallback| LS[localStorage]

    GHA -->|triggers| NX
    GHA -->|triggers| VERCEL
    VERCEL -->|deploys| RC
    VERCEL -->|deploys| FC

    style RC fill:#87CEEB
    style FC fill:#90EE90
    style TW fill:#FFE55C
    style DB fill:#DDA0DD
    style AUTH fill:#FF5459,stroke-dasharray: 5 5
    style RT fill:#E68161,stroke-dasharray: 5 5
```

## Component Architecture - Reward Chart

```mermaid
graph LR
    subgraph "Reward Chart App"
        APP[App Component]
        HEADER[Header Component]
        CHILD[Child Card Component]
        REWARDS[Rewards Modal]
        SETTINGS[Settings Modal]
        CONFETTI[Confetti Component]

        CDS[Chart Data Service<br/>BehaviorSubject]
        SS[Supabase Service]

        APP --> HEADER
        APP --> CHILD
        APP --> REWARDS
        APP --> SETTINGS
        APP --> CONFETTI

        HEADER --> CDS
        CHILD --> CDS
        REWARDS --> CDS
        SETTINGS --> CDS
        CDS --> SS
    end

    subgraph "Supabase"
        FM[family_members]
        HAB[habits]
        STAR[stars]
        REW[rewards]
        SETT[settings]
    end

    SS --> FM
    SS --> HAB
    SS --> STAR
    SS --> REW
    SS --> SETT

    style CDS fill:#32B8C6
    style SS fill:#2DA6B2
```

## Component Architecture - Family Calendar

```mermaid
graph LR
    subgraph "Family Calendar App"
        APP2[App Component]
        CAL[Calendar Component]
        FORM[Event Form Component]

        ES[Event Service<br/>Signals]
        SS2[Supabase Service]

        APP2 --> CAL
        APP2 --> FORM

        CAL --> ES
        FORM --> ES
        ES --> SS2
        ES -.fallback.-> LS2[localStorage]
    end

    subgraph "Supabase"
        EV[events]
    end

    SS2 --> EV

    style ES fill:#32B8C6
    style SS2 fill:#2DA6B2
```

## Data Flow - Reward Chart

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant ChartDataService
    participant SupabaseService
    participant Database

    User->>Component: Click star
    Component->>ChartDataService: updateStars()
    ChartDataService->>ChartDataService: Update BehaviorSubject
    ChartDataService->>Component: Emit new state
    Component->>User: UI updates
    ChartDataService->>SupabaseService: saveStar()
    SupabaseService->>Database: INSERT/UPDATE
    Database-->>SupabaseService: Confirm
    SupabaseService-->>ChartDataService: Success
```

## Data Flow - Family Calendar

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant EventService
    participant SupabaseService
    participant Database

    User->>Component: Create event
    Component->>EventService: addEvent()
    EventService->>EventService: Update signal
    EventService->>Component: Signal change
    Component->>User: UI updates

    alt Supabase configured
        EventService->>SupabaseService: insertEvent()
        SupabaseService->>Database: INSERT
        Database-->>SupabaseService: Confirm
    else Supabase not configured
        EventService->>EventService: saveToLocalStorage()
    end
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Developer Workflow"
        DEV[Developer<br/>Local Machine]
        GIT[Git Push<br/>to main]
    end

    subgraph "GitHub"
        REPO[Repository<br/>nmck91/playground]
        ACTIONS[GitHub Actions<br/>Workflow]
    end

    subgraph "Nx Cloud"
        CACHE[Build Cache]
        DIST[Task Distribution]
    end

    subgraph "Vercel"
        BUILD[Build Step<br/>nx build]
        DEPLOY_RC[Deploy Reward Chart]
        DEPLOY_FC[Deploy Family Calendar]
    end

    subgraph "Production"
        PROD_RC[family-reward-chart<br/>.vercel.app]
        PROD_FC[family-calendar<br/>.vercel.app]
    end

    DEV -->|git push| GIT
    GIT --> REPO
    REPO -->|webhook| ACTIONS
    REPO -->|webhook| VERCEL

    ACTIONS -->|lint, test, build, e2e| CACHE
    ACTIONS --> DIST

    VERCEL --> BUILD
    BUILD --> DEPLOY_RC
    BUILD --> DEPLOY_FC

    DEPLOY_RC --> PROD_RC
    DEPLOY_FC --> PROD_FC

    style PROD_RC fill:#87CEEB
    style PROD_FC fill:#90EE90
```

## Nx Project Graph

```mermaid
graph LR
    subgraph "Applications"
        RC[reward-chart]
        FC[family-calendar]
        RCE2E[reward-chart-e2e]
        FCE2E[family-calendar-e2e]
    end

    subgraph "Libraries"
        TW[tailwind-preset]
    end

    RC -.depends on.-> TW
    FC -.depends on.-> TW
    RCE2E -->|tests| RC
    FCE2E -->|tests| FC

    style RC fill:#87CEEB
    style FC fill:#90EE90
    style TW fill:#FFE55C
    style RCE2E fill:#DDA0DD
    style FCE2E fill:#DDA0DD
```

## Technology Stack Layers

```mermaid
graph TD
    subgraph "Presentation Layer"
        A1[Angular Components<br/>Standalone]
        A2[PrimeNG Components<br/>UI Library]
        A3[Tailwind CSS<br/>Utility Styles]
    end

    subgraph "State Management Layer"
        S1[RxJS BehaviorSubject<br/>Reward Chart]
        S2[Angular Signals<br/>Family Calendar]
    end

    subgraph "Business Logic Layer"
        B1[Services<br/>ChartData, Event]
        B2[Models/Interfaces<br/>TypeScript Types]
    end

    subgraph "Data Access Layer"
        D1[Supabase Service<br/>Database Client]
        D2[localStorage<br/>Fallback Storage]
    end

    subgraph "Backend Services"
        DB[(Supabase PostgreSQL)]
    end

    A1 --> S1
    A1 --> S2
    S1 --> B1
    S2 --> B1
    B1 --> D1
    B1 --> D2
    D1 --> DB

    A2 --> A1
    A3 --> A1
```

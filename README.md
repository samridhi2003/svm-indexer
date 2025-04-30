<div align="center">

# Sonic SVM Blockchain Dashboard / The SVM Indexer

<img src="public/banner.png" alt="Sonic SVM Blockchain Dashboard" width="400"/>

</div>


This project is a web-based dashboard focused on providing data analytics, enhancing transparency, and enabling real-time monitoring for the **Sonic SVM** blockchain ecosystem. Built to address the need for comprehensive data tools in emerging SVM environments, this dashboard aims to empower developers, users, and stakeholders with actionable insights into on-chain assets and projects within the Sonic network. It leverages blazingly fast indexing, particularly with optimizations from Sorada.

## Features

*   **Dashboard Overview:** Presents key metrics and information about the Sonic SVM ecosystem through a tabbed interface.
*   **Sonic Transaction Monitoring:**
    *   Displays a list of recent or relevant transactions occurring on the Sonic SVM chain.
    *   Provides a detailed view for individual Sonic transactions (accessed via transaction hash).
*   **Sonic Wallet Overview:** Shows a summary of wallet balances, assets, or other relevant data specific to wallets on the Sonic network.
*   **Sonic Program Analytics:** Offers analytics and insights into the performance or usage of specific programs (smart contracts) deployed on Sonic SVM.
*   **Leaderboards:** Tracks and displays rankings based on metrics relevant to the Sonic ecosystem (e.g., transaction volume, specific program interactions).
*   **Transaction and Program Bubblemaps:** Visualizes concentrations and links in on-chain data, providing insights into asset flows and contract interactions.
*   **Ask via OpenAI:** Allows users to feed current page information to OpenAI for detailed, context-aware explanations and analysis.

## Performance

*   **Sorada Integration:** Utilizes Sonic's Sorada for RPC queries, achieving up to **30x faster** read request times compared to standard RPC endpoints, enabling near real-time data access.

## Tech Stack

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (built on Radix UI & Tailwind)
*   **Charting:** Recharts
*   **Forms & Validation:** React Hook Form, Zod
*   **Language:** TypeScript
*   **Indexing:** Sorada (from Sonic)
*   **AI Integration:** OpenAI API

## Acknowledgements

Special thanks to the organizers (Sonic, Superteam, Helius) of the hackathon where this project was developed and refined. It was a great learning experience!

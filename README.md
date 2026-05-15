# Courier Rush 🚚

A browser-based graph simulation and delivery game that brings **Kruskal's Minimum Spanning Tree** and **Dijkstra's Shortest Path Algorithm** to life. Built as a Quiz 2 assignment for the Design and Analysis of Algorithms (DAA) course.

---

## What Is This?

**Courier Rush** is a game divided into two exciting graph-based phases:

1. **Phase 1: Road Repair (Kruskal's MST)**
   A recent storm has damaged the city's roads. Before the courier can start delivering packages, you must select the most cost-effective roads to repair. The goal is to connect all locations (nodes) with the minimum possible cost without creating any loops (cycles) — exactly what Kruskal's Algorithm does.
   
2. **Phase 2: Delivery Route (Dijkstra's Shortest Path)**
   Once the roads are repaired, you play as the courier starting at the warehouse. Your goal is to deliver packages to their destinations by navigating a weighted graph. You must avoid blocked roads and account for heavy traffic (slow roads) to find the shortest total distance. 

At the end of the game, the **Result Screen** will display a side-by-side visual comparison showing your route stacked against the mathematically optimal routes calculated by the algorithms!

---

## Features

- **Dual Graph Algorithms:** Fully implements Kruskal's (DSU/Union-Find) and Dijkstra's (Priority/Distance mapping) algorithms under the hood.
- **Interactive Visualizations:** Node and edge clicking, dynamic SVG map highlighting, and smooth courier animations.
- **Visual Route Comparison:** A massive interactive map on the result screen that overlays your chosen path with the optimal algorithm path.
- **Premium UI / UX:** 100% unified, premium dark-mode aesthetic with custom animations, glassmorphism shadows, and gold/green accent colors.
- **Retro Background Music:** Built-in toggleable BGM for a more immersive arcade gaming experience.

---

## Algorithms Explained

### 1. Kruskal's Minimum Spanning Tree (MST)
Used in the *Road Repair Phase*.
* **How it works:** Kruskal's algorithm sorts all edges in the graph by their weight (cost) from lowest to highest. It then continuously adds the cheapest edge to the Spanning Tree, provided it doesn't form a cycle. To detect cycles efficiently, it uses the **Disjoint Set Union (DSU)** data structure.
* **In-game:** Your efficiency score is calculated by comparing your total repair cost against the optimal cost found by Kruskal.

### 2. Dijkstra's Shortest Path
Used in the *Delivery Phase*.
* **How it works:** Dijkstra's algorithm finds the shortest path from a single source node to all other nodes. It keeps track of the shortest known distance to every node and updates these values as it traverses edges, processing the closest unvisited node first.
* **In-game:** The algorithm calculates the absolute shortest route to deliver all packages. Your route's total distance is then compared to this optimal distance.

---

## Tech Stack

- **Framework:** Next.js 15 (React 18)
- **Styling:** CSS Modules with modern flexbox/grid architectures.
- **Graph Visualization:** Pure HTML5/SVG manipulation without heavy external libraries.
- **Language:** TypeScript

---

## How to Run Locally

1. Clone this repository.
2. Ensure you have Node.js installed.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
6. *(Optional)* Place a `bgm.mp3` file inside the `public/` directory to enable background music.

---



---
*Created for PAA/DAA Quiz 2 Evaluation.*

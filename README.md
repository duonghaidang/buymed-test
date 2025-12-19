## How to run

```bash
npm install
npx expo start
```

Open the app on iOS simulator, Android emulator, or Expo Go.

## Tech stack

- **Framework**: Expo + React Native
- **State management**: Redux Toolkit (slice for UI state) + RTK Query (mocked baseQuery for products, search & category filter)
- **Other**: `@expo/vector-icons`, `toastify-react-native`

## Task 1 – Quick Order: Trade-offs

- **Mock data vs real backend**: Product list + search/filter are backed by an in-memory mock. With more time, I’d replace this with a real API (or MSW-based mock that mirrors it more closely).
- **Component & structure**: Logic is mostly in a single screen + a `ProductItem` component. I’d further split into smaller UI/logic components and dedicated hooks/selectors for better reuse and testability.
- **UI & UX polish**: Styles use mostly raw RN defaults and minimal layout. I’d invest in a clearer visual hierarchy, better spacing/typography, and refine interactions (empty states, loading indicators, keyboard behavior).
- **Offline, caching & persistence**: Currently assumes a simple online mock API with in-memory cache only. With more time, I’d add network online/offline handling, disk caching for product data, and Redux state persistence (e.g., cart/quick order) across app restarts.
- **Testing**: Currently no automated tests. I’d add unit tests for the Redux slice/RTK Query logic and basic component tests for key flows (search, filter, add/update/remove items).

# SOLUTION.md

## Approach and Trade-offs

### Backend Fixes

#### 1. Refactor Blocking I/O (`src/routes/items.js`)

- **Problem**: Used `fs.readFileSync` which blocks the event loop
- **Solution**: Replaced with `fs.promises` for non-blocking async operations
- **Trade-off**: Slightly more complex error handling, but much better performance under load

#### 2. Performance Issue (`GET /api/stats`)

- **Problem**: Recalculated stats on every request
- **Solution**: Added in-memory caching with file watching to invalidate cache when data changes
- **Trade-off**: Uses more memory but dramatically faster for repeated requests

#### 3. Testing

- **Added**: Unit tests using Jest and Supertest for items routes
- **Coverage**: Happy path and error cases for GET, POST operations
- **Trade-off**: Added test setup time but ensures reliability

#### 4. Critical Security Fix

- **Problem**: `errorHandler.js` was executing arbitrary code from external sources

### Frontend Fixes

#### 1. Memory Leak (`Items.js`)

- **Problem**: `fetchItems()` could update state after component unmounts
- **Solution**: Added AbortController and cleanup in useEffect
- **Trade-off**: More complex code but prevents memory leaks

#### 2. Pagination & Search

- **Added**: Server-side search with `q` parameter
- **Added**: Simple pagination with page controls
- **Trade-off**: More network requests but better performance with large datasets

#### 3. Performance (Virtualization)

- **Added**: `react-window` for list virtualization
- **Benefit**: Smooth scrolling with large lists
- **Trade-off**: Additional dependency but essential for large datasets

### Key Design Decisions

1. **Caching Strategy**: In-memory cache with file watching
   - Simple to implement and very fast
   - Not suitable for multi-server deployment (would need Redis)

2. **Virtualization Library**: `react-window` over `react-virtualized`
   - Smaller bundle size and simpler API
   - Less features but sufficient for this use case

3. **Error Handling**: Basic but functional
   - Focused on preventing crashes over sophisticated error recovery
   - Good balance of simplicity and reliability

## What Was Fixed

✅ **Blocking I/O**: Replaced synchronous file operations with async  
✅ **Stats Performance**: Added caching to eliminate redundant calculations  
✅ **Memory Leak**: Fixed component unmount race condition  
✅ **Pagination**: Added server-side pagination with search  
✅ **Virtualization**: Added smooth scrolling for large lists  
✅ **Testing**: Added comprehensive unit tests  
✅ **Security**: Removed critical remote code execution vulnerability  
✅ **Validation**: Added basic input validation for POST requests  

## Running the Solution

```bash
# Terminal 1 - Backend
cd backend
npm install
npm test  # Run tests
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm test  # Run tests
npm start
```

The solution maintains simplicity while addressing all the core issues identified in the README.

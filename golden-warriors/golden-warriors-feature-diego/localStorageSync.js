// localStorage syncs with backend
(function() {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;
    
    // Generate a unique identifier for this browser/user
    let userId = localStorage.getItem('browser_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      originalSetItem.call(localStorage, 'browser_user_id', userId);
    }
    
    // Keys to sync with backend
    const keysToSync = ['habitProgress', 'habitHistory', 'isLoggedIn'];
    
    
    localStorage.setItem = function(key, value) {
  
      originalSetItem.call(localStorage, key, value);
      
     
      if (keysToSync.includes(key)) {
        
        let parsedValue;
        try {
          
          parsedValue = JSON.parse(value);
        } catch (e) {
          
          parsedValue = value;
        }
        
        
        fetch(`/api/local-storage/${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId
          },
          body: JSON.stringify({ value: parsedValue })
        }).catch(err => console.error('Error syncing localStorage:', err));
      }
    };
    
    
    localStorage.removeItem = function(key) {
     
      originalRemoveItem.call(localStorage, key);
      
      // Only sync specific keys
      if (keysToSync.includes(key)) {
        // Delete from backend
        fetch(`/api/local-storage/${key}`, {
          method: 'DELETE',
          headers: {
            'X-User-ID': userId
          }
        }).catch(err => console.error('Error deleting from backend:', err));
      }
    };
    
    // Initialize by syncing from server
    const initializeFromServer = async () => {
      try {
        
        const response = await fetch('/api/local-storage', {
          headers: {
            'X-User-ID': userId
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch data from server');
        
        const result = await response.json();
        
        if (result.success && result.data) {
          
          result.data.forEach(item => {
            if (keysToSync.includes(item.key) && !originalGetItem.call(localStorage, item.key)) {
              const valueToStore = typeof item.value === 'object' 
                ? JSON.stringify(item.value) 
                : String(item.value);
              originalSetItem.call(localStorage, item.key, valueToStore);
            }
          });
        }
        
        console.log('localStorage sync initialized and data loaded from server');
      } catch (err) {
        console.error('Error initializing from server:', err);
        console.log('localStorage sync initialized with local data only');
      }
    };
    
    
    initializeFromServer();
  })();

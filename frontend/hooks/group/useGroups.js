import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as groupService from '../../services/group/groupService';

export default function useGroups({ initialFetch = true } = {}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const email = await AsyncStorage.getItem('email');
      if (!email) {
        setGroups([]);
        return [];
      }

      const res = await groupService.fetchGroups(email); 
      const arr = Array.isArray(res) ? res : (res.grupos || res.rows || []);
      setGroups(arr);
      return arr;
    } catch (err) {
      setError(err);
      console.error('useGroups.fetchGroups', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFetch) fetchGroups();
  }, [fetchGroups, initialFetch]);

  const refresh = fetchGroups;

  const groupsCount = groups.length;
  const preview = groups.slice(0, 3);

  return { groups, preview, groupsCount, loading, error, fetchGroups, refresh, setGroups };
}

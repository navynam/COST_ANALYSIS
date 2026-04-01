import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useDashboardPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('3m');

  return { navigate, period, setPeriod };
};

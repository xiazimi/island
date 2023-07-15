import { useRoutes } from 'react-router-dom';
import { routes } from 'island:routes';

export const Content = () => {
  console.log(routes);

  const rootElement = useRoutes(routes);

  return rootElement;
};

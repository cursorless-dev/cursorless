import { render } from '@testing-library/react';

import Cheatsheet from './cheatsheet';

describe('Cheatsheet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Cheatsheet />);
    expect(baseElement).toBeTruthy();
  });
});

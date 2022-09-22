import { render } from '@testing-library/react';

import EmbeddedVideo from './embedded-video';

describe('ReactEmbeddedVideo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EmbeddedVideo youtubeSlug={''} />);
    expect(baseElement).toBeTruthy();
  });
});

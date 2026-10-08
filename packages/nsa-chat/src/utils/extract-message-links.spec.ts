import { extractMessageLinks } from './extract-message-links';

describe('extractMessageLinks', () => {
  it('returns empty array for empty content', () => {
    expect(extractMessageLinks('')).toEqual([]);
    expect(extractMessageLinks(null)).toEqual([]);
  });

  it('extracts http and https links with offsets', () => {
    const content = 'Check https://example.com and http://test.org';
    expect(extractMessageLinks(content)).toEqual([
      {
        url: 'https://example.com',
        startOffset: 6,
        endOffset: 25,
        order: 0,
      },
      {
        url: 'http://test.org',
        startOffset: 30,
        endOffset: 45,
        order: 1,
      },
    ]);
  });

  it('extracts www links and trims trailing punctuation', () => {
    const content = 'Visit www.example.com.';
    expect(extractMessageLinks(content)).toEqual([
      {
        url: 'www.example.com',
        startOffset: 6,
        endOffset: 21,
        order: 0,
      },
    ]);
  });
});

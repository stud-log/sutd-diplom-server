export function extractPathFromUrl(url: string): string {
  // Replacing both backslashes and forward slashes with a forward slash
  const normalizedUrl = url.replace(/[\\/]/g, '/');

  // Removing the "src/static/" part from the beginning of the string
  const pathPrefix = 'src/static/';
  const prefixIndex = normalizedUrl.indexOf(pathPrefix);
  if (prefixIndex !== -1) {
    return normalizedUrl.substring(prefixIndex + pathPrefix.length);
  } else {
    // If "src/static/" is not found, return the original string
    return url;
  }
}
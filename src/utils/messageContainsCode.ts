export function messageContainsCode(message: string) {
  const regex =
    /[{}()=+&%\<\>\[\]\|#`]|\b(gist\.github\.com|codepen\.io|function|const|var|return|class|import|export|interface|null|<script>|=>)\b/;
  return regex.test(message);
}

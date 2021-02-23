import urbitOb from 'urbit-ob';

import { Content } from '@urbit/api';

const URL_REGEX = new RegExp(String(/^((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/.source));

const isUrl = (string) => {
  try {
    return URL_REGEX.test(string);
  } catch (e) {
    return false;
  }
}

const tokenizeMessage = (text: string): Content[] => {
  let messages: Content[] = [];
  let message: string[] = [];
  let isInCodeBlock = false;
  let endOfCodeBlock = false;
  text.split(/\r?\n/).forEach((line, index) => {
    if (index !== 0) {
      message.push('\n');
    }
    // A line of backticks enters and exits a codeblock
    if (line.startsWith('```')) {
      // But we need to check if we've ended a codeblock
      endOfCodeBlock = isInCodeBlock;
      isInCodeBlock = (!isInCodeBlock);
    } else {
      endOfCodeBlock = false;
    }

    if (isInCodeBlock || endOfCodeBlock) {
      message.push(line);
    } else {
      line.split(/\s/).forEach((str) => {
        if (
          (str.startsWith('`') && str !== '`')
          || (str === '`' && !isInCodeBlock)
        ) {
          isInCodeBlock = true;
        } else if (
          (str.endsWith('`') && str !== '`')
          || (str === '`' && isInCodeBlock)
        ) {
          isInCodeBlock = false;
        }

        if (isUrl(str) && !isInCodeBlock) {
          if (message.length > 0) {
            // If we're in the middle of a message, add it to the stack and reset
            messages.push({ text: message.join(' ') });
            message = [];
          }
          messages.push({ url: str });
          message = [];
        } else if (urbitOb.isValidPatp(str.replace(/[^a-z\-\~]/g, '')) && !isInCodeBlock) {
          if (message.length > 0) {
            // If we're in the middle of a message, add it to the stack and reset
            messages.push({ text: message.join(' ') });
            message = [];
          }
          messages.push({ mention: str.replace(/[^a-z\-\~]/g, '') });
          if (str.replace(/[a-z\-\~]/g, '').length > 0) {
            messages.push({ text: str.replace(/[a-z\-\~]/g, '') });
          }
          message = [];

        } else {
          message.push(str);
        }
      });
    }
  });

  if (message.length) {
    // Add any remaining message
    messages.push({ text: message.join(' ') });
  }
  return messages;
};

export { tokenizeMessage as default, isUrl, URL_REGEX };

import { CKEditor } from '@ckeditor/ckeditor5-react';

import { FILE_URL, requestUploadFile } from '@/utils/baseAPI';

import {
  InlineEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HtmlComment,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Markdown,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  SimpleUploadAdapter,
  SourceEditing,
  SpecialCharacters,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
  SelectAll,
  Undo,
  Enter,
  ShiftEnter,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './style.scss';

import MathType from '@wiris/mathtype-ckeditor5/dist/index.js';
import '@wiris/mathtype-ckeditor5/dist/index.css';
import { useEffect, useMemo, useRef, useState } from 'react';

const sanitizeConfig = {
  allowedTags: [
    // Basic formatting
    'p',
    'br',
    'b',
    'i',
    'em',
    'strong',
    'u',
    'strike',
    // Headings
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Lists
    'ul',
    'ol',
    'li',
    // Tables
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    // Other elements
    'div',
    'span',
    'a',
    'img',
    'pre',
    'code',
    'blockquote',
  ],
  allowedAttributes: {
    '*': ['class', 'style'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    table: ['border', 'cellpadding', 'cellspacing'],
  },
  allowedStyles: {
    '*': {
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'font-size': [/^\d+(?:px|em|%)$/],
      'font-family': [/.*/],
      'text-decoration': [/^underline$/, /^line-through$/],
    },
  },
  allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: true,
};

const createUploadAdapter = loader => {
  return {
    upload: async () => {
      try {
        const file = await loader.file;
        const formData = new FormData();
        formData.append('files', file);

        const response = await requestUploadFile('api/v1/attachments/public', formData);
        if (response.status === 200 && response.data?.data?.[0]?.url) {
          return {
            default: `${FILE_URL}${response.data.data[0].url}`,
          };
        }
        throw new Error('Upload failed');
      } catch (error) {
        console.error('File upload error:', error);
        throw error;
      }
    },
    abort: () => {
      // Implement abort logic if needed
    },
  };
};

function uploadPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return createUploadAdapter(loader);
  };
}

const TDEditorInline = ({ data, onChange, placeholder = '', readOnly = false }) => {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const editorWordCountRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        extraPlugins: [uploadPlugin],
        toolbar: {
          items: [
            'undo',
            'redo',
            'removeFormat',
            '|',
            'selectAll',
            'fontSize',
            'fontFamily',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'code',
            '|',
            'link',
            'insertTable',
            'blockQuote',
            'codeBlock',
            '|',
            'alignment',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent',
            '|',
            'code',
            'sourceEditing',
            'MathType',
            'ChemType',
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BlockQuote,
          Bold,
          Code,
          CodeBlock,
          Essentials,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          FullPage,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HtmlComment,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          Markdown,
          Paragraph,
          PasteFromMarkdownExperimental,
          PasteFromOffice,
          RemoveFormat,
          SimpleUploadAdapter,
          SourceEditing,
          SpecialCharacters,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
          WordCount,
          SelectAll,
          SimpleUploadAdapter,
          SourceEditing,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          Underline,
          Undo,
          Enter,
          ShiftEnter,
          MathType,
        ],
        fontFamily: {
          supportAllValues: true,
        },
        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 22],
          supportAllValues: true,
        },
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: true,
              attributes: true,
              classes: true,
            },
          ],
        },
        image: {
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage',
          ],
        },
        initialData: '',
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file',
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        placeholder: '',
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
        },
      },
    };
  }, [isLayoutReady]);

  /*   const handleChange = (_, editor) => {
    const content = editor.getData();
    const sanitizedContent = sanitizeHtml(content, sanitizeConfig);
    onChange(sanitizedContent);
  };

  const sanitizedInitialData = useMemo(() => sanitizeHtml(data, sanitizeConfig), [data, sanitizeConfig]);
 */
  return (
    <div className="ck-question">
      <div ref={editorRef}>
        {editorConfig && (
          <CKEditor
            editor={InlineEditor}
            config={editorConfig}
            data={data}
            onChange={(event, editor) => {
              const data = editor.getData();
              onChange(data);
            }}
          />
        )}
      </div>
    </div>
  );
};
export default TDEditorInline;

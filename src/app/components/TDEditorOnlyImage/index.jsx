import { CKEditor } from '@ckeditor/ckeditor5-react';
import { FILE_URL, requestUploadFile } from '@/utils/baseAPI';

import {
  InlineEditor,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageResizeEditing,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Markdown,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  SimpleUploadAdapter,
  SourceEditing,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './style.scss';

import MathType from '@wiris/mathtype-ckeditor5/dist/index.js';
import '@wiris/mathtype-ckeditor5/dist/index.css';

import { useEffect, useMemo, useRef, useState } from 'react';

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
    abort: () => { },
  };
};

function uploadPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return createUploadAdapter(loader);
  };
}

const TDEditorOnlyImage = ({ data, onChange, placeholder = '' }) => {
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
            'imageUpload',
            '|',
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            'imageStyle:side',
            '|',
            'resizeImage',
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageResizeEditing,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Markdown,
          Paragraph,
          PasteFromMarkdownExperimental,
          PasteFromOffice,
          RemoveFormat,
          SimpleUploadAdapter,
          SourceEditing,
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
          resizeUnit: '%',
          resizeOptions: [
            {
              name: 'imageResize:original',
              value: null,
              label: 'Original',
            },
            {
              name: 'imageResize:50',
              value: '50',
              label: '50%',
            },
            {
              name: 'imageResize:75',
              value: '75',
              label: '75%',
            },
            {
              name: 'imageResize:custom',
              value: 'custom',
              label: 'Custom',
            },
          ],
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            'imageStyle:side',
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

export default TDEditorOnlyImage;
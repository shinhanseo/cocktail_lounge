import './styles.scss'

import { TextStyleKit } from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type Props = {
  initialHTML?: string;
  onChangeHTML?: (html: string) => void;
  className?: string;
};

const extensions = [TextStyleKit, StarterKit]

function MenuBar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isStrike: ctx.editor.isActive("strike") ?? false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
      isParagraph: ctx.editor.isActive("paragraph") ?? false,
      isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      isBlockquote: ctx.editor.isActive("blockquote") ?? false,
      canUndo: ctx.editor.can().chain().undo().run() ?? false,
      canRedo: ctx.editor.can().chain().redo().run() ?? false,
    }),
  });

  // 버튼 스타일 (높이 ↓, 폰트 ↓, 패딩 ↓)
  const btnBase =
    "h-6 px-2 rounded-md border text-xs leading-5 transition " +
    "bg-white text-gray-900 border-black/10 hover:bg-gray-50 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";
  const btnActive = "bg-teal-50 border-teal-400";
  const groupCls =
    "flex flex-nowrap items-center gap-1 p-1 rounded-md bg-white/80 border border-black/10 overflow-x-auto scrollbar-hide";

  const Sep = () => (
    <span className="mx-1 h-4 w-px bg-black/10 inline-block align-middle" />
  );

  return (
    <div className="mb-2">
      <div className={groupCls}>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!s.canBold}
          className={`${btnBase} ${s.isBold ? btnActive : ""}`}
        >
          B
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!s.canItalic}
          className={`${btnBase} ${s.isItalic ? btnActive : ""}`}
        >
          I
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!s.canStrike}
          className={`${btnBase} ${s.isStrike ? btnActive : ""}`}
        >
          S
        </button>
        <Sep />

        <button
          type='button'
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`${btnBase} ${s.isParagraph ? btnActive : ""}`}
        >
          P
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`${btnBase} ${s.isHeading1 ? btnActive : ""}`}
        >
          H1
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnBase} ${s.isHeading2 ? btnActive : ""}`}
        >
          H2
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btnBase} ${s.isHeading3 ? btnActive : ""}`}
        >
          H3
        </button>

        <Sep />

        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${s.isBulletList ? btnActive : ""}`}
        >
          • 
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${s.isOrderedList ? btnActive : ""}`}
        >
          1.
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btnBase} ${s.isBlockquote ? btnActive : ""}`}
        >
          “ Q
        </button>

        <Sep />

        <button
          type='button'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnBase}
        >
          HR
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className={btnBase}
        >
          BR
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!s.canUndo}
          className={btnBase}
        >
          ⤺
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!s.canRedo}
          className={btnBase}
        >
          ⤼
        </button>
      </div>
    </div>
  );
}



export default function ContentWriting({
  initialHTML = "<p>본문을 작성해주세요</p>",
  onChangeHTML,
  className = "",
}: Props) {
  const editor = useEditor({
    extensions,
    content: initialHTML,
    onUpdate: ({ editor }) => onChangeHTML?.(editor.getHTML()),
  });

  return (
    <div className={className}>
      {/* editor가 초기화되기 전에도 MenuBar는 렌더되므로, editor 단언 */}
      {editor && <MenuBar editor={editor as Editor} />}
      <EditorContent
        editor={editor}
        className="tiptap w-full p-4 rounded-xl bg-white/90 text-gray-900 focus:bg-white focus:outline-none transition-all"
      />
    </div>
  );
}
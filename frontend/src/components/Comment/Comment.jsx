import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Comment({ postId }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  // --- 페이지네이션용 쿼리스트링 (page, limit) ---
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 5);

  // --- 상태 정의 ---
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit,
    pageCount: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postComment, setPostComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // --- 댓글 목록 불러오기 ---
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `http://localhost:4000/api/comment/${postId}`,
          {
            params: { page, limit },
          }
        );
        if (ignore) return;

        setComments(Array.isArray(res.data?.comments) ? res.data.comments : []);
        setMeta(
          res.data?.meta ?? {
            total: 0,
            page,
            limit,
            pageCount: 1,
            hasPrev: page > 1,
            hasNext: false,
          }
        );
      } catch (err) {
        console.error(err);
        setError("댓글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [postId, page, limit]);

  // --- 페이지 이동 함수 ---
  const goPage = (p) =>
    setSearchParams({ page: String(p), limit: String(limit) });

  // --- 댓글 작성 ---
  const handleComment = async () => {
    if (!isLoggedIn) {
      alert("로그인 상태에서만 가능합니다.");
      navigate("/login");
      return;
    }
    if (!postComment.trim()) {
      alert("댓글을 입력하세요!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/comment",
        { postId, body: postComment.trim() },
        { withCredentials: true }
      );
      if (res.status === 201) {
        alert("댓글이 등록되었습니다!");
        setPostComment("");
        // 새 댓글 등록 시 첫 페이지로 이동
        goPage(1);
      }
    } catch (err) {
      console.error(err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  // --- 댓글 수정 ---
  const handleEdit = (comment) => {
    setEditCommentId(comment.id);
    setEditText(comment.body);
  };

  const handleSave = async (commentId) => {
    if (!editText.trim()) {
      alert("내용을 입력하세요!");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:4000/api/comment/${commentId}`,
        { body: editText },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, body: editText } : c))
        );
        alert("댓글이 수정되었습니다!");
        setEditCommentId(null);
      }
    } catch (err) {
      console.error(err);
      alert("수정 도중 오류가 발생했습니다.");
    }
  };

  // --- 댓글 삭제 ---
  const handleDelete = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      alert("댓글이 삭제되었습니다.");
    } catch (err) {
      console.log(err);
      alert("삭제 도중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="mt-10 text-white bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">
        댓글
      </h3>

      {/* 입력창 */}
      <div className="mb-6">
        <textarea
          placeholder="댓글을 입력하세요..."
          className="w-full bg-white/10 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
          value={postComment}
          onChange={(e) => setPostComment(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={handleComment}
          >
            등록
          </button>
        </div>
      </div>

      {/* 로딩/에러 처리 */}
      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400">댓글이 없습니다.</p>
      ) : (
        <>
          {/* 댓글 목록 */}
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="border-b border-white/10 pb-3 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{comment.author}</span>
                  <span className="text-sm text-gray-400">{comment.date}</span>
                </div>

                {editCommentId === comment.id ? (
                  <div>
                    <textarea
                      className="w-full bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none"
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="bg-button hover:bg-button-hover px-3 py-1 rounded-lg text-white"
                        onClick={() => handleSave(comment.id)}
                      >
                        저장
                      </button>
                      <button
                        className="bg-white/50 hover:bg-white/30 px-3 py-1 rounded-lg text-white"
                        onClick={() => setEditCommentId(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-200">{comment.body}</p>
                    {user?.login_id === comment.author && (
                      <div>
                        <button
                          className="bg-button hover:bg-button-hover px-2 py-1 rounded-lg text-white"
                          onClick={() => handleEdit(comment)}
                        >
                          수정
                        </button>
                        <button
                          className="bg-white/50 hover:bg-white/30 px-2 py-1 rounded-lg text-white ml-2"
                          onClick={() => handleDelete(comment.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-center gap-3 py-5">
            <button
              onClick={() => goPage(meta.page - 1)}
              disabled={!meta.hasPrev}
              className="px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                         disabled:opacity-40 hover:bg-white/10 transition-colors hover:cursor-pointer"
            >
              ← 이전
            </button>

            <span className="text-sm text-white/70">
              {meta.page} / {meta.pageCount}
            </span>

            <button
              onClick={() => goPage(meta.page + 1)}
              disabled={!meta.hasNext}
              className="px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                         disabled:opacity-40 hover:bg-white/10 transition-colors hover:cursor-pointer"
            >
              다음 →
            </button>
          </div>
        </>
      )}
    </section>
  );
}

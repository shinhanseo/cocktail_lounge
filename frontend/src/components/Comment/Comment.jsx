import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Comment({ postId }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postcomment, setPostcomment] = useState("");

  // ✨ 추가: 댓글별 편집 상태 저장
  const [editCommentId, setEditCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // 수정 버튼 클릭 시
  const handleEdit = (comment) => {
    setEditCommentId(comment.id);
    setEditText(comment.body);
  };

  // 수정 내용 저장
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

  const handleDelete = async (commentId) => {
    //댓글 삭제
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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:4000/api/comment/${postId}`
        );
        setComments(res.data.comments || []);
      } catch (err) {
        console.error(err);
        setError("댓글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const onChange = (e) => setPostcomment(e.target.value);

  const handleComment = async () => {
    if (!isLoggedIn) {
      alert("로그인 상태에서만 가능합니다.");
      navigate("/login");
      return;
    }
    if (!postcomment.trim()) {
      alert("댓글을 입력하세요!");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:4000/api/comment",
        { postId, body: postcomment.trim() },
        { withCredentials: true }
      );
      if (res.status === 201) {
        alert("댓글이 등록되었습니다!");
        setPostcomment("");
        setComments((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="mt-10 text-white bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">
        댓글
      </h3>

      {/* 댓글 입력창 */}
      <div className="mb-6">
        <textarea
          placeholder="댓글을 입력하세요..."
          className="w-full bg-white/10 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
          value={postcomment}
          onChange={onChange}
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

      {/* 댓글 목록 */}
      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
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

              {/* 수정 모드일 때 textarea로 표시 */}
              {editCommentId === comment.id ? (
                <div>
                  <textarea
                    className="w-full bg-white/10 rounded-lg p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="bg-button hover:bg-button-hover px-3 py-1 rounded-lg text-white hover:scale-105 hover:text-m hover:cursor-pointer"
                      onClick={() => handleSave(comment.id)}
                    >
                      저장
                    </button>
                    <button
                      className="bg-white/50 hover:bg-white/30 px-3 py-1 rounded-lg text-white hover:scale-105 hover:text-m hover:cursor-pointer"
                      onClick={() => setEditCommentId(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 표시 모드
                <div className="flex justify-between items-center">
                  <p className="text-gray-200">{comment.body}</p>
                  {user?.login_id === comment.author && (
                    <div>
                      <button
                        className="bg-button hover:bg-button-hover px-3 py-1 rounded-lg text-white hover:scale-105 hover:text-m hover:cursor-pointer"
                        onClick={() => handleEdit(comment)}
                      >
                        수정
                      </button>
                      <button
                        className="bg-white/50 hover:bg-white/30 px-3 py-1 rounded-lg text-white hover:scale-105 hover:text-m hover:cursor-pointer ml-2"
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
      )}
    </section>
  );
}

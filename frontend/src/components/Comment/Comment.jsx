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
  const handleEdit = () => {
    //navigate(`/communityedit/${id}`);
  };
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
  // 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError("");
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

  // 댓글 등록
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
        setPostcomment(""); // 입력창 비우기
        setComments((prev) => [res.data, ...prev]); // 새 댓글 목록에 추가
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={() => handleComment}
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
              <div className="flex justify-between items-center">
                <p className="text-gray-200">{comment.body}</p>
                <div>
                  {user?.login_id === comment.author ? (
                    <div>
                      <button
                        className="text-whtie text-sm font-semibold bg-white/5 border border-white/10 p-2 rounded-2xl hover:scale-105 hover:text-m hover:cursor-pointer"
                        onClick={() => handleEdit}
                      >
                        수정
                      </button>
                      <button
                        className="text-whtie text-sm font-semibold bg-white/5 border border-white/10 p-2 rounded-2xl hover:scale-105 hover:text-m hover:cursor-pointer ml-2"
                        onClick={() => handleDelete(comment.id)}
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

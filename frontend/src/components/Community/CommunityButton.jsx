import postButton from "../../assets/post.jpg";

export default function CommunityButton() {
  const addPost = (e) => {
    e.preventDefault();
    // 글 작성 로직 추가 예정
  };

  return (
    <form onSubmit={addPost} className="text-right mr-8">
      <button
        type="submit"
        className="text-white ml-5 p-2 bg-white rounded-full hover:scale-110 hover:cursor-pointer"
      >
        <img
          src={postButton}
          alt="글쓰기 버튼"
          className="w-6 h-6 object-cover"
        ></img>
      </button>
    </form>
  );
}

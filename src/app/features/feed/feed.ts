import { Commentsservice } from './../../core/services/comments-service/commentsservice';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Postsservice } from '../../core/services/posts-service/postsservice';
import { Subscription } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faThumbsUp,
  faComment,
  faShare,
  faEllipsis,
  faGlobe,
  faChevronDown,
  faImage,
  faFaceSmile,
  faPaperPlane,
  faXmark,
  faCircleCheck,
  faBookmark,
  faPenToSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-feed',
  imports: [FaIconComponent, DatePipe, FormsModule, RouterLink],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit, OnDestroy {
  private readonly postsservice = inject(Postsservice);
  private readonly Commentsservice = inject(Commentsservice);
  private readonly cdr = inject(ChangeDetectorRef);

  // Icons
  faThumbsUp = faThumbsUp;
  faComment = faComment;
  faShare = faShare;
  faEllipsis = faEllipsis;
  faGlobe = faGlobe;
  faChevronDown = faChevronDown;
  faImage = faImage;
  faFaceSmile = faFaceSmile;
  faPaperPlane = faPaperPlane;
  faXmark = faXmark;
  faCircleCheck = faCircleCheck;
  faBookmark = faBookmark;
  faPenToSquare = faPenToSquare;
  faTrash = faTrash;

  // FIX #4: سبسكريبشن منفصلة للـ feed والـ post
  private feedSub$: Subscription = new Subscription();
  private postSub$: Subscription = new Subscription();

  posts: any[] = [];

  currentUser: {
    _id: string;
    name: string;
    photo: string;
    username: string;
    email: string;
    cover: string;
  } = { _id: '', name: '', photo: '', username: '', email: '', cover: '' };

  get firstName(): string {
    return this.currentUser.name?.split(' ')[0] ?? '';
  }

  // Create post state
  postBody: string = '';
  selectedPrivacy: string = 'Public';
  showPrivacyMenu: boolean = false;
  privacyOptions: string[] = ['Public', 'Friends', 'Only me'];
  selectedImage: string | null = null;
  selectedFile: File | null = null;
  showEmojiPicker: boolean = false;
  postBodyError: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  emojis: string[] = [
    '😀',
    '😂',
    '😍',
    '🥰',
    '😎',
    '😢',
    '😡',
    '🤔',
    '👍',
    '👎',
    '❤️',
    '🔥',
    '🎉',
    '😭',
    '🙏',
    '💪',
    '😊',
    '🤣',
    '😅',
    '🥳',
  ];

  isLoading: boolean = false;

  // Share modal state
  showShareModal: boolean = false;
  shareBody: string = '';
  selectedSharePost: any = null;

  // Comments state
  openCommentsPostId: string | null = null;
  postComments: any[] = [];
  commentsLoading: boolean = false;
  commentUploading: boolean = false;
  newComment: string = '';
  commentImage: string | null = null;
  commentFile: File | null = null;
  showCommentEmojiPicker: boolean = false;
  commentEmojis: string[] = [
    '😀',
    '😂',
    '😍',
    '🥰',
    '😎',
    '😢',
    '😡',
    '🤔',
    '👍',
    '👎',
    '❤️',
    '🔥',
    '🎉',
    '😭',
    '🙏',
    '💪',
    '😊',
    '🤣',
    '😅',
    '🥳',
  ];

  // Post menu
  openMenuPostId: string | null = null;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.GetPosts();
    this.GetFriendSuggFollow();
  }

  loadCurrentUser(): void {
    try {
      const raw = localStorage.getItem('userdata');
      if (raw) this.currentUser = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse userdata from localStorage', e);
    }
  }

  togglePostMenu(postId: string): void {
    this.openMenuPostId = this.openMenuPostId === postId ? null : postId;
  }

  isMyPost(post: any): boolean {
    return post.user?._id === this.currentUser._id;
  }

  togglePrivacyMenu(): void {
    this.showPrivacyMenu = !this.showPrivacyMenu;
  }

  selectPrivacy(option: string): void {
    this.selectedPrivacy = option;
    this.showPrivacyMenu = false;
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.postBody += emoji;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.selectedFile = null;
  }

  showToastNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  submitPost(): void {
    if (!this.postBody.trim() && !this.selectedFile) return;

    const formData = new FormData();
    if (this.postBody.trim()) formData.append('body', this.postBody);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    // FIX #4: بنستخدم postSub$ منفصلة عشان ما نقطعش ريكويست الـ feed
    this.postSub$.unsubscribe();
    this.postSub$ = this.postsservice.CreatPost(formData).subscribe({
      next: (res: any) => {
        console.log(res);
        this.postBody = '';
        this.selectedImage = null;
        this.selectedFile = null;
        this.showEmojiPicker = false;
        this.GetPosts();
        this.showToastNotification('Post created successfully!', 'success');
      },
      error: (err: any) => {
        console.log(err);
        this.showToastNotification('Error creating post', 'error');
      },
    });
  }

  openShareModal(post: any): void {
    this.selectedSharePost = post;
    this.shareBody = '';
    this.showShareModal = true;
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.selectedSharePost = null;
    this.shareBody = '';
  }

  confirmShare(): void {
    if (!this.selectedSharePost) return;
    const body = this.shareBody.trim() || 'Shared this post';
    this.SharePostToFeed({ body }, this.selectedSharePost._id);
    this.closeShareModal();
  }

  SharePostToFeed(body: Object, postId: string): void {
    this.postsservice.SharePost(body, postId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.GetPosts();
        this.showToastNotification('Post shared successfully!', 'success');
      },
      error: (err: any) => {
        console.log(err);
        const msg = err.error?.message || 'Something went wrong';
        this.showToastNotification(msg, 'error');
      },
    });
  }

  toggleComments(postId: string): void {
    if (this.openCommentsPostId === postId) {
      this.openCommentsPostId = null;
      this.postComments = [];
      this.showCommentEmojiPicker = false;
    } else {
      this.openCommentsPostId = postId;
      this.GetPostComments(postId);
    }
  }

  GetPostComments(postId: string): void {
    this.commentsLoading = true;
    this.Commentsservice.GetAllComments(postId).subscribe({
      next: (res: any) => {
        this.postComments = res.data.comments;
        this.commentsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        this.commentsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleCommentEmojiPicker(): void {
    this.showCommentEmojiPicker = !this.showCommentEmojiPicker;
  }

  addCommentEmoji(emoji: string): void {
    this.newComment += emoji;
  }

  onCommentFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.commentFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.commentImage = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeCommentImage(): void {
    this.commentImage = null;
    this.commentFile = null;
  }

  submitComments(): void {
    if (!this.newComment.trim() && !this.commentFile) return;

    const formData = new FormData();
    if (this.newComment.trim()) formData.append('content', this.newComment);
    if (this.commentFile) formData.append('image', this.commentFile);

    this.commentUploading = true;
    this.commentsLoading = true;
    this.cdr.detectChanges();

    this.Commentsservice.CreateComment(formData, this.openCommentsPostId!).subscribe({
      next: (res: any) => {
        // FIX #1: بنصفر كل حاجة الأول
        this.newComment = '';
        this.commentImage = null;
        this.commentFile = null;
        this.showCommentEmojiPicker = false;
        this.commentUploading = false;
        // FIX #1: commentsLoading هتتصفر جوا GetPostComments لما ترجع
        this.GetPostComments(this.openCommentsPostId!);
        this.showToastNotification('Comment added successfully!', 'success');
      },
      error: (err: any) => {
        this.commentUploading = false;
        this.commentsLoading = false; // ✅ بنصفرها في الـ error
        this.cdr.detectChanges();
        const msg = err.error?.message || 'Something went wrong';
        this.showToastNotification(msg, 'error');
      },
    });
  }

  GetPosts(): void {
    this.isLoading = true;
    this.feedSub$.unsubscribe();
    this.feedSub$ = this.postsservice.GetAllPosts().subscribe({
      next: (res: any) => {
        this.posts = [...res.data.posts];
        // نملأ likedPostIds بالبوستات اللي فيها ID بتاعي
        this.likedPostIds.clear();
        this.posts.forEach((post) => {
          if (post.likes?.includes(this.currentUser._id)) {
            this.likedPostIds.add(post._id);
          }
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  showImageModal: boolean = false;
  selectedPreviewImage: string = '';

  openImagePreview(imageUrl: string): void {
    this.selectedPreviewImage = imageUrl;
    this.showImageModal = true;
  }

  closeImagePreview(): void {
    this.showImageModal = false;
    this.selectedPreviewImage = '';
  }

  openCommentMenuId: string | null = null;

  toggleCommentMenu(event: Event, commentId: string): void {
    event.stopPropagation();
    this.openCommentMenuId = this.openCommentMenuId === commentId ? null : commentId;
  }

  @HostListener('document:click')
  closeCommentMenu(): void {
    this.openCommentMenuId = null;
  }

  // FIX #3: deleteComment مكتملة مع API call
  deleteComment(comment: any): void {
    console.log(comment);
  }

  editingCommentId: string | null = null;
  editContent: string = '';
  selectedEditFile: File | null = null;
  editImagePreview: string | null = null;
  isImageDeleted: boolean = false;
  isUpdating: boolean = false;

  startUpdateComment(comment: any): void {
    this.editingCommentId = comment._id;
    this.editContent = comment.content;
    this.editImagePreview = comment.image;
    this.isImageDeleted = false;
    this.selectedEditFile = null;
    this.openCommentMenuId = null;
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedEditFile = file;
      this.isImageDeleted = false;
      const reader = new FileReader();
      reader.onload = () => (this.editImagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submitUpdate(comment: any): void {
    if (this.isUpdating) return;

    this.isUpdating = true;
    const formData = new FormData();
    formData.append('content', this.editContent);

    if (this.selectedEditFile) {
      formData.append('image', this.selectedEditFile);
    } else if (this.isImageDeleted) {
      formData.append('image', '');
    }

    this.Commentsservice.UpdateComment(formData, comment.post, comment._id).subscribe({
      next: (res: any) => {
        console.log('Update Success:', res);
        this.isUpdating = false;
        this.cancelEdit();
        // FIX #2: بدل ما نتخمن شكل الـ response بنعمل ريلود كامل للكومنتات
        this.GetPostComments(this.openCommentsPostId!);
        this.showToastNotification('Comment updated successfully!', 'success');
      },
      error: (err: any) => {
        console.error('Update Error:', err);
        this.isUpdating = false;
        const msg = err.error?.message || 'Something went wrong';
        this.showToastNotification(msg, 'error');
      },
    });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editContent = '';
    this.selectedEditFile = null;
    this.editImagePreview = null;
    this.isImageDeleted = false;
  }

  // 1. أضف المتغير ده مع باقي المتغيرات
  suggestions: any[] = [];

  // 2. غير الفانكشن دي - خليها على suggSub$ منفصلة مش postSub$
  private suggSub$: Subscription = new Subscription();

  GetFriendSuggFollow(): void {
    this.suggSub$.unsubscribe();
    this.suggSub$ = this.postsservice.GetFollowSugg().subscribe({
      next: (res) => {
        this.suggestions = res.data.suggestions;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ToggleFollow(userId: string): void {
    this.suggSub$.unsubscribe();
    this.suggSub$ = this.postsservice.FollowORUnfollowUser(userId).subscribe({
      next: (res) => {
        if (res.data.following == true) {
          this.showToastNotification('you followed this user successfully!', 'success');
          this.GetFriendSuggFollow();
        } else {
          this.showToastNotification('you unfollowed this user successfully!', 'success');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  LikeLoading: boolean = false;
  loadingLikePostId: string | null = null;
  likedPostIds: Set<string> = new Set();

  ToggleLike(postId: string): void {
    if (this.loadingLikePostId) return;

    this.loadingLikePostId = postId;

    this.postsservice.LikeORUnlikePost(postId).subscribe({
      next: (res) => {
        console.log(res);
        if (res.data.liked === true) {
          this.likedPostIds.add(postId);
          this.showToastNotification('You liked this post!', 'success');
        } else {
          this.likedPostIds.delete(postId);
          this.showToastNotification('You unliked this post!', 'success');
        }

        const post = this.posts.find((p) => p._id === postId);
        if (post) {
          post.likesCount += res.data.liked ? 1 : -1;
        }
        this.loadingLikePostId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loadingLikePostId = null;
        this.cdr.detectChanges();
      },
    });
  }

  // متغيرات الـ modal
  showDeleteModal: boolean = false;
  deleteTargetType: 'post' | 'comment' | null = null;
  postToDeleteId: string | null = null;
  commentToDelete: any = null;

  openDeleteModal(type: 'post' | 'comment', data: any): void {
    this.deleteTargetType = type;
    if (type === 'post') {
      this.postToDeleteId = data;
      this.openMenuPostId = null;
    } else {
      this.commentToDelete = data;
      this.openCommentMenuId = null;
    }
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTargetType = null;
    this.postToDeleteId = null;
    this.commentToDelete = null;
  }

  confirmDelete(): void {
    if (this.deleteTargetType === 'post') {
      this.DeleteMyPost();
    } else if (this.deleteTargetType === 'comment') {
      this.DeleteComment();
    }
  }

  DeleteMyPost(): void {
    if (!this.postToDeleteId) return;
    this.suggSub$.unsubscribe();
    this.suggSub$ = this.postsservice.DeletePost(this.postToDeleteId).subscribe({
      next: (res: any) => {
        this.posts = this.posts.filter((p) => p._id !== this.postToDeleteId);
        this.closeDeleteModal();
        this.showToastNotification('Post deleted successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.closeDeleteModal();
        this.showToastNotification('Error deleting post', 'error');
      },
    });
  }

  DeleteComment(): void {
    if (!this.commentToDelete) return;
    this.Commentsservice.DeleteComment(
      this.commentToDelete.post,
      this.commentToDelete._id,
    ).subscribe({
      next: (res: any) => {
        this.postComments = this.postComments.filter((c) => c._id !== this.commentToDelete._id);
        this.closeDeleteModal();
        this.showToastNotification('Comment deleted successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.closeDeleteModal();
        this.showToastNotification('Error deleting comment', 'error');
      },
    });
  }

  // أضف المتغيرات دول مع باقي المتغيرات
  editingPostId: string | null = null;
  editPostBody: string = '';
  isUpdatingPost: boolean = false;

  // افتح وضع التعديل
  startEditPost(post: any): void {
    this.editingPostId = post._id;
    this.editPostBody = post.body || '';
    this.openMenuPostId = null; // نقفل الـ dropdown
  }

  // إلغاء التعديل
  cancelEditPost(): void {
    this.editingPostId = null;
    this.editPostBody = '';
  }

  // إرسال التعديل
  submitEditPost(post: any): void {
    if (this.isUpdatingPost) return;
    if (!this.editPostBody.trim()) return;

    this.isUpdatingPost = true;
    const formData = new FormData();
    formData.append('body', this.editPostBody.trim());

    this.suggSub$.unsubscribe();
    this.suggSub$ = this.postsservice.UpdatePost(formData, post._id).subscribe({
      next: (res: any) => {
        // نحدث البوست في المصفوفة مباشرة بدون ريلود
        const index = this.posts.findIndex((p) => p._id === post._id);
        if (index !== -1) {
          this.posts[index] = { ...this.posts[index], body: this.editPostBody.trim() };
        }
        this.isUpdatingPost = false;
        this.cancelEditPost();
        this.showToastNotification('Post updated successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
        this.isUpdatingPost = false;
        const msg = err.error?.message || 'Something went wrong';
        this.showToastNotification(msg, 'error');
      },
    });
  }

  bookmarkedPostIds: Set<string> = new Set();
  loadingBookmarkPostId: string | null = null;

  toggleBookmark(postId: string): void {
    if (this.loadingBookmarkPostId) return;
    this.loadingBookmarkPostId = postId;
    this.cdr.detectChanges();

    this.postsservice.BookmarkUnbookmarkPost(postId).subscribe({
      next: (res: any) => {
        // 1. بندور على البوست في المصفوفة اللي معروضة قدام اليوزر
        const post = this.posts.find((p) => p._id === postId);

        if (post) {
          // 2. تحديث قيمة البوست بناءً على رد السيرفر "تحديداً"
          post.bookmarked = res.data.bookmarked;

          // 3. مزامنة الـ Set برضه عشان لو مستخدمها في أماكن تانية
          if (post.bookmarked) {
            this.bookmarkedPostIds.add(postId);
            this.showToastNotification('Bookmarked successfully', 'success');
          } else {
            this.bookmarkedPostIds.delete(postId);
            this.showToastNotification('Removed from bookmarks', 'success');
          }
        }

        this.loadingBookmarkPostId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingBookmarkPostId = null;
        this.cdr.detectChanges();
      },
    });
  }

  isCommentLiked(comment: any): boolean {
    return comment.likes?.includes(this.currentUser._id);
  }

  ToggleLikeComment(commentId: string, postId: string): void {
    this.Commentsservice.LikeOrDislikeComment(commentId, postId).subscribe({
      next: (res: any) => {
        // We reload the comments to update the UI state
        this.GetPostComments(postId);
        this.cdr.detectChanges();

        // Show success notification based on the toggle result
        const message =
          res.data?.liked === false
            ? 'Comment unliked successfully!'
            : 'Comment liked successfully!';
        this.showToastNotification(message, 'success');
      },
      error: (err: any) => {
        console.error(err);
        const msg = err.error?.message || 'Something went wrong';
        this.showToastNotification(msg, 'error');
      },
    });
  }

  // Replies
  openReplyCommentId: string | null = null;
  repliesMap: { [commentId: string]: any[] } = {};
  repliesLoadingId: string | null = null;
  replyTextMap: { [commentId: string]: string } = {};
  replySubmittingId: string | null = null;

  toggleReply(commentId: string): void {
    if (this.openReplyCommentId === commentId) {
      this.openReplyCommentId = null;
      return;
    }
    this.openReplyCommentId = commentId;
    if (!this.repliesMap[commentId]) {
      this.loadReplies(commentId);
    }
  }

  loadReplies(commentId: string): void {
    this.repliesLoadingId = commentId;
    this.Commentsservice.GetReply({}, this.openCommentsPostId!, commentId).subscribe({
      next: (res: any) => {
        this.repliesMap[commentId] = res.data.replies ?? res.data ?? [];
        this.repliesLoadingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.repliesLoadingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  submitReply(commentId: string): void {
    const text = this.replyTextMap[commentId]?.trim();
    if (!text || this.replySubmittingId) return;

    this.replySubmittingId = commentId;
    const formData = new FormData();
    formData.append('content', text);

    this.Commentsservice.CreatReply(formData, this.openCommentsPostId!, commentId).subscribe({
      next: () => {
        this.replyTextMap[commentId] = '';
        this.replySubmittingId = null;
        this.loadReplies(commentId);
        this.showToastNotification('Reply added!', 'success');
      },
      error: (err: any) => {
        this.replySubmittingId = null;
        this.showToastNotification(err.error?.message || 'Something went wrong', 'error');
      },
    });
  }

  ngOnDestroy(): void {
    this.feedSub$.unsubscribe();
    this.postSub$.unsubscribe();
    this.suggSub$.unsubscribe();
  }
}

import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faThumbsUp,
  faComment,
  faShare,
  faEllipsis,
  faImage,
  faFaceSmile,
  faPaperPlane,
  faXmark,
  faCircleCheck,
  faBookmark,
  faPenToSquare,
  faTrash,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Postsservice } from '../../core/services/posts-service/postsservice';
import { Commentsservice } from '../../core/services/comments-service/commentsservice';

@Component({
  selector: 'app-post-details',
  imports: [FaIconComponent, DatePipe, FormsModule],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css',
})
export class PostDetails implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postsservice = inject(Postsservice);
  private readonly commentsservice = inject(Commentsservice);
  private readonly cdr = inject(ChangeDetectorRef);

  // Icons
  faThumbsUp = faThumbsUp;
  faComment = faComment;
  faShare = faShare;
  faEllipsis = faEllipsis;
  faImage = faImage;
  faFaceSmile = faFaceSmile;
  faPaperPlane = faPaperPlane;
  faXmark = faXmark;
  faCircleCheck = faCircleCheck;
  faBookmark = faBookmark;
  faPenToSquare = faPenToSquare;
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;

  private sub$: Subscription = new Subscription();

  post: any = null;
  isLoading: boolean = true;
  postId: string = '';

  currentUser: { _id: string; name: string; photo: string; username: string } = {
    _id: '', name: '', photo: '', username: '',
  };

  get firstName(): string {
    return this.currentUser.name?.split(' ')[0] ?? '';
  }

  // Comments
  postComments: any[] = [];
  commentsLoading: boolean = false;
  commentUploading: boolean = false;
  newComment: string = '';
  commentImage: string | null = null;
  commentFile: File | null = null;
  showCommentEmojiPicker: boolean = false;
  commentEmojis: string[] = [
    '😀','😂','😍','🥰','😎','😢','😡','🤔',
    '👍','👎','❤️','🔥','🎉','😭','🙏','💪',
    '😊','🤣','😅','🥳',
  ];

  // Like
  isLiked: boolean = false;
  loadingLike: boolean = false;

  // Bookmark
  loadingBookmark: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  // Share Modal
  showShareModal: boolean = false;
  shareBody: string = '';

  // Image Modal
  showImageModal: boolean = false;
  selectedPreviewImage: string = '';

  // Delete Modal
  showDeleteModal: boolean = false;
  deleteTargetType: 'post' | 'comment' | null = null;
  commentToDelete: any = null;

  // Post Edit
  isEditingPost: boolean = false;
  editPostBody: string = '';
  isUpdatingPost: boolean = false;

  // Comment Edit
  editingCommentId: string | null = null;
  editContent: string = '';
  selectedEditFile: File | null = null;
  editImagePreview: string | null = null;
  isImageDeleted: boolean = false;
  isUpdating: boolean = false;

  // Comment Menu
  openCommentMenuId: string | null = null;

  // Replies
  openReplyCommentId: string | null = null;
  repliesMap: { [commentId: string]: any[] } = {};
  repliesLoadingId: string | null = null;
  replyTextMap: { [commentId: string]: string } = {};
  replySubmittingId: string | null = null;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.postId = this.route.snapshot.paramMap.get('id')!;
    this.loadPost();
    this.loadComments();
  }

  loadCurrentUser(): void {
    try {
      const raw = localStorage.getItem('userdata');
      if (raw) this.currentUser = JSON.parse(raw);
    } catch (e) {}
  }

  loadPost(): void {
    this.isLoading = true;
    this.sub$.add(
      this.postsservice.GetSinglePost(this.postId).subscribe({
        next: (res: any) => {
          this.post = res.data.post;
          this.isLiked = this.post.likes?.includes(this.currentUser._id);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      })
    );
  }

  loadComments(): void {
    this.commentsLoading = true;
    this.sub$.add(
      this.commentsservice.GetAllComments(this.postId).subscribe({
        next: (res: any) => {
          this.postComments = res.data.comments;
          this.commentsLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.commentsLoading = false;
          this.cdr.detectChanges();
        },
      })
    );
  }

  isMyPost(): boolean {
    return this.post?.user?._id === this.currentUser._id;
  }

  isCommentLiked(comment: any): boolean {
    return comment.likes?.includes(this.currentUser._id);
  }

  // ─── Like ────────────────────────────────────────────
  toggleLike(): void {
    if (this.loadingLike) return;
    this.loadingLike = true;
    this.postsservice.LikeORUnlikePost(this.postId).subscribe({
      next: (res: any) => {
        this.isLiked = res.data.liked;
        this.post.likesCount += res.data.liked ? 1 : -1;
        this.loadingLike = false;
        this.showToastNotification(
          res.data.liked ? 'You liked this post!' : 'You unliked this post!',
          'success'
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingLike = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Bookmark ─────────────────────────────────────────
  toggleBookmark(): void {
    if (this.loadingBookmark) return;
    this.loadingBookmark = true;
    this.postsservice.BookmarkUnbookmarkPost(this.postId).subscribe({
      next: (res: any) => {
        this.post.bookmarked = res.data.bookmarked;
        this.loadingBookmark = false;
        this.showToastNotification(
          res.data.bookmarked ? 'Bookmarked successfully' : 'Removed from bookmarks',
          'success'
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingBookmark = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Share ────────────────────────────────────────────
  openShareModal(): void {
    this.shareBody = '';
    this.showShareModal = true;
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.shareBody = '';
  }

  confirmShare(): void {
    const body = this.shareBody.trim() || 'Shared this post';
    this.postsservice.SharePost({ body }, this.postId).subscribe({
      next: () => {
        this.post.sharesCount += 1;
        this.closeShareModal();
        this.showToastNotification('Post shared successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.closeShareModal();
        const msg = err.error?.message || 'Something went wrong';
        this.showToastNotification(msg, 'error');
      },
    });
  }

  // ─── Post Edit ────────────────────────────────────────
  startEditPost(): void {
    this.isEditingPost = true;
    this.editPostBody = this.post.body || '';
  }

  cancelEditPost(): void {
    this.isEditingPost = false;
    this.editPostBody = '';
  }

  submitEditPost(): void {
    if (this.isUpdatingPost || !this.editPostBody.trim()) return;
    this.isUpdatingPost = true;
    const formData = new FormData();
    formData.append('body', this.editPostBody.trim());
    this.postsservice.UpdatePost(formData, this.postId).subscribe({
      next: () => {
        this.post.body = this.editPostBody.trim();
        this.isUpdatingPost = false;
        this.cancelEditPost();
        this.showToastNotification('Post updated successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isUpdatingPost = false;
        this.showToastNotification(err.error?.message || 'Something went wrong', 'error');
      },
    });
  }

  // ─── Post Delete ──────────────────────────────────────
  openDeletePostModal(): void {
    this.deleteTargetType = 'post';
    this.showDeleteModal = true;
  }

  // ─── Comment Delete ───────────────────────────────────
  openDeleteCommentModal(comment: any): void {
    this.deleteTargetType = 'comment';
    this.commentToDelete = comment;
    this.openCommentMenuId = null;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTargetType = null;
    this.commentToDelete = null;
  }

  confirmDelete(): void {
    if (this.deleteTargetType === 'post') {
      this.postsservice.DeletePost(this.postId).subscribe({
        next: () => {
          this.showToastNotification('Post deleted successfully!', 'success');
          setTimeout(() => this.router.navigate(['/feed']), 1000);
        },
        error: () => this.showToastNotification('Error deleting post', 'error'),
      });
    } else {
      this.commentsservice.DeleteComment(this.commentToDelete.post, this.commentToDelete._id).subscribe({
        next: () => {
          this.postComments = this.postComments.filter(c => c._id !== this.commentToDelete._id);
          this.post.commentsCount -= 1;
          this.closeDeleteModal();
          this.showToastNotification('Comment deleted successfully!', 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          this.closeDeleteModal();
          this.showToastNotification('Error deleting comment', 'error');
        },
      });
    }
  }

  // ─── Comment Submit ───────────────────────────────────
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

  addCommentEmoji(emoji: string): void {
    this.newComment += emoji;
  }

  toggleCommentEmojiPicker(): void {
    this.showCommentEmojiPicker = !this.showCommentEmojiPicker;
  }

  submitComment(): void {
    if (!this.newComment.trim() && !this.commentFile) return;
    const formData = new FormData();
    if (this.newComment.trim()) formData.append('content', this.newComment);
    if (this.commentFile) formData.append('image', this.commentFile);

    this.commentUploading = true;
    this.commentsLoading = true;
    this.cdr.detectChanges();

    this.commentsservice.CreateComment(formData, this.postId).subscribe({
      next: () => {
        this.newComment = '';
        this.commentImage = null;
        this.commentFile = null;
        this.showCommentEmojiPicker = false;
        this.commentUploading = false;
        this.post.commentsCount += 1;
        this.loadComments();
        this.showToastNotification('Comment added successfully!', 'success');
      },
      error: (err: any) => {
        this.commentUploading = false;
        this.commentsLoading = false;
        this.cdr.detectChanges();
        this.showToastNotification(err.error?.message || 'Something went wrong', 'error');
      },
    });
  }

  // ─── Comment Edit ─────────────────────────────────────
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
    if (!file) return;
    this.selectedEditFile = file;
    this.isImageDeleted = false;
    const reader = new FileReader();
    reader.onload = () => (this.editImagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  submitUpdate(comment: any): void {
    if (this.isUpdating) return;
    this.isUpdating = true;
    const formData = new FormData();
    formData.append('content', this.editContent);
    if (this.selectedEditFile) formData.append('image', this.selectedEditFile);
    else if (this.isImageDeleted) formData.append('image', '');

    this.commentsservice.UpdateComment(formData, comment.post, comment._id).subscribe({
      next: () => {
        this.isUpdating = false;
        this.cancelEdit();
        this.loadComments();
        this.showToastNotification('Comment updated successfully!', 'success');
      },
      error: (err: any) => {
        this.isUpdating = false;
        this.showToastNotification(err.error?.message || 'Something went wrong', 'error');
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

  // ─── Comment Like ─────────────────────────────────────
  toggleLikeComment(commentId: string): void {
    this.commentsservice.LikeOrDislikeComment(commentId, this.postId).subscribe({
      next: (res: any) => {
        this.loadComments();
        const msg = res.data?.liked === false ? 'Comment unliked!' : 'Comment liked!';
        this.showToastNotification(msg, 'success');
      },
      error: (err: any) =>
        this.showToastNotification(err.error?.message || 'Something went wrong', 'error'),
    });
  }

  // ─── Replies ──────────────────────────────────────────
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
    this.commentsservice.GetReply({}, this.postId, commentId).subscribe({
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

    this.commentsservice.CreatReply(formData, this.postId, commentId).subscribe({
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

  // ─── Comment Menu ─────────────────────────────────────
  toggleCommentMenu(event: Event, commentId: string): void {
    event.stopPropagation();
    this.openCommentMenuId = this.openCommentMenuId === commentId ? null : commentId;
  }

  @HostListener('document:click')
  closeCommentMenu(): void {
    this.openCommentMenuId = null;
  }

  // ─── Image Preview ────────────────────────────────────
  openImagePreview(url: string): void {
    this.selectedPreviewImage = url;
    this.showImageModal = true;
  }

  closeImagePreview(): void {
    this.showImageModal = false;
    this.selectedPreviewImage = '';
  }

  // ─── Toast ────────────────────────────────────────────
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

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }
}
import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    Divider
} from '@mui/material';
import { UserProfile } from '@/features/auth/services/authService';
import { getFollowers, getFollowing } from '@/features/auth/services/followService';
import { MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface FollowListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    type: 'followers' | 'following';
    title: string;
}

export function FollowListDialog({ isOpen, onClose, userId, type, title }: FollowListDialogProps) {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId) {
            setIsLoading(true);
            const fetchFn = type === 'followers' ? getFollowers : getFollowing;
            fetchFn(userId)
                .then(data => setProfiles(data as any))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, userId, type]);

    const handleProfileClick = (profile: UserProfile) => {
        onClose();
        if (profile.role === 'EMPLOYER') {
            navigate({ to: `/candidate/employer/${profile.uid}` as any });
        } else {
            navigate({ to: `/employer/candidate/${profile.uid}` as any });
        }
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: { borderRadius: '24px' }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
                {title}
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, maxHeight: '60vh' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="text.secondary">Đang tải danh sách...</Typography>
                    </Box>
                ) : profiles.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2, color: 'text.secondary' }}>
                        <UserPlus size={48} strokeWidth={1} />
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Danh sách trống</Typography>
                    </Box>
                ) : (
                    <List sx={{ py: 0 }}>
                        {profiles.map((profile, index) => (
                            <Box key={profile.uid}>
                                <ListItem 
                                    sx={{ 
                                        py: 2, 
                                        px: 2,
                                        '&:hover': { bgcolor: 'action.hover' },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleProfileClick(profile)}
                                >
                                    <ListItemAvatar>
                                        <Avatar 
                                            src={profile.avatarUrl || ''} 
                                            sx={{ 
                                                width: 44, 
                                                height: 44, 
                                                border: '1px solid #eee',
                                                bgcolor: 'primary.light',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {profile.fullName.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                {profile.role === 'EMPLOYER' ? (profile as any).company_name || profile.fullName : profile.fullName}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                {profile.role === 'EMPLOYER' ? 'Doanh nghiệp' : 'Ứng viên'}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton 
                                            edge="end" 
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClose();
                                                const chatTo = profile.role === 'EMPLOYER' ? '/candidate/chat' : '/employer/chat';
                                                const searchKey = profile.role === 'EMPLOYER' ? 'employerId' : 'candidateId';
                                                navigate({ 
                                                    to: chatTo as any,
                                                    search: { [searchKey]: profile.uid } as any
                                                });
                                            }}
                                            sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
                                        >
                                            <MessageCircle size={20} />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < profiles.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
}

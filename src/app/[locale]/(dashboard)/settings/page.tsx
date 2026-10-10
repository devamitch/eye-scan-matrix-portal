'use client';

import TitleHeader from '@/components/layout/Title/TitleHeader';
import AiScanSettings from '@/components/settings/aiScanSettings/AiScanSettings';
import Notifications from '@/components/settings/notifications/notifications';
import useTranslationData from '@/hooks/use-translation-data';
import { useRouter } from '@/i18n/navigation';
import { ChevronRight, LogOut } from 'lucide-react';
import styles from './SettingsPage.module.css';
import useAppStore from '@/store';

export default function SettingsPage() {
	const { settingsPageText } = useTranslationData();
	const router = useRouter();
const logout=useAppStore(state=>state.auth.logout);
	const handleLogout = async () => {
		try {
			await logout();
			router.push('/signin');
		} catch (error) {
			console.error('Error signing out: ', error);
		}
	};

	return (
		<div className={styles.container}>
			<>
				<TitleHeader title={settingsPageText.sectionTitles.accountSettings} />
				<div className={styles.section}>
					<button className={styles.button}>
						<span>{settingsPageText.accountSettings.profileInfo}</span>
						<ChevronRight size={21} />
					</button>
					<button className={styles.button}>
						<span>{settingsPageText.accountSettings.changePassword}</span>
						<ChevronRight size={21} />
					</button>
				</div>
			</>

			<>
				<TitleHeader title={settingsPageText.sectionTitles.aiScanSettings} />
				<AiScanSettings />
			</>

			<>
				<TitleHeader title={settingsPageText.sectionTitles.discoveryPreferences} />
				<div className={styles.section}>
					<button className={styles.button}>
						<span>{settingsPageText.discoveryPreferences.specialistRegion}</span>
						<ChevronRight size={21} />
					</button>
					<button className={styles.button}>
						<span>{settingsPageText.discoveryPreferences.productCategories}</span>
						<ChevronRight size={21} />
					</button>
				</div>
			</>

			<>
				<TitleHeader title={settingsPageText.sectionTitles.notification} />
				<Notifications />
			</>

			<>
				<TitleHeader title={settingsPageText.sectionTitles.privacyData} />
				<div className={styles.section}>
					<button className={styles.button}>
						<span>{settingsPageText.privacyData.appPermission}</span>
						<ChevronRight size={21} />
					</button>
					<button className={styles.button}>
						<span>{settingsPageText.privacyData.downloadMyData}</span>
						<ChevronRight size={21} />
					</button>
					<button className={styles.button}>
						<p>{settingsPageText.privacyData.deleteMyData}</p>
						<ChevronRight size={21} />
					</button>
				</div>
			</>

			<>
				<TitleHeader title={settingsPageText.sectionTitles.helpSupport} />
				<div className={styles.section}>
					<button className={styles.button}>
						<span>{settingsPageText.helpSupport.faq}</span>
						<ChevronRight size={21} />
					</button>
					<button className={styles.button}>
						<span>{settingsPageText.helpSupport.contactUs}</span>
						<ChevronRight size={21} />
					</button>
					<button className={styles.button}>
						<p>{settingsPageText.helpSupport.termsPrivacy}</p>
						<ChevronRight size={21} />
					</button>
				</div>
			</>

			<>
				<div className={styles.section}>
					<button onClick={handleLogout} className={styles.Logoutbutton}>
						<LogOut size={21} />
						{settingsPageText.logOut}
					</button>
				</div>
			</>
		</div>
	);
}

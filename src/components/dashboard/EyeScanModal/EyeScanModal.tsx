import Dialog from '@/components/layout/Modal/Dialog';
import { CamScreen } from '@/components/dashboard/EyeTracking/camscreen/CamScreen';
import useTranslationData from '@/hooks/use-translation-data';
import { EyeMetrics } from '@/hooks/useEyeTracking';
import { useEyeTrackingContext } from '@/provider/EyeTrackingProvider';
import { StopCircle, Eye, Activity, AlertTriangle, Battery, Brain, User, Clock, Target, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './EyeScanModal.module.css';

interface EyeScanModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentMetrics: EyeMetrics | null;
}

interface MetricComparison {
	after: EyeMetrics | null;
}

const EyeScanModal: React.FC<EyeScanModalProps> = ({
	isOpen,
	onClose,
	currentMetrics,
}) => {
	const [isScanning, setIsScanning] = useState(false);
	const [scanCompleted, setScanCompleted] = useState(false);
	const [countdown, setCountdown] = useState(30);
	const [metricsComparison, setMetricsComparison] = useState<MetricComparison>({
		after: null,
	});

	const { livePageText, eyeMetricsDisplayText } = useTranslationData();
	const t = useTranslations();
	const { 
		videoRef: contextVideoRef, 
		canvasRef: contextCanvasRef, 
		metrics,
		startTracking,
		stopTracking,
		isActive,
		loading,
		error,
		cameraReady
	} = useEyeTrackingContext();

	const handleStartScan = async () => {
		setIsScanning(true);
		setScanCompleted(false);
		setCountdown(30);
		
		// Start tracking if not already active
		try {
			if (!isActive) {
				await startTracking();
			}
		} catch (error) {
			console.error('Failed to start scan:', error);
		}
	};

	const handleStopScan = () => {
		setIsScanning(false);
		
		if (currentMetrics) {
			setMetricsComparison({
				after: { ...currentMetrics },
			});
		}
		
		setScanCompleted(true);
		// Don't stop tracking here to maintain camera state
	};

	const handleClose = () => {
		setIsScanning(false);
		setScanCompleted(false);
		setCountdown(30);
		setMetricsComparison({ after: null });
		onClose();
	};
	useEffect(() => {
		if (isOpen && !isScanning && !scanCompleted) {
			handleStartScan();
		}
	}, [isOpen]);
	useEffect(() => {
		let interval: NodeJS.Timeout;
		
		if (isScanning && countdown > 0) {
			interval = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						handleStopScan();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isScanning, countdown]);

	const getStatus = (value: number, type: string) => {
		switch (type) {
			case 'blinkRate':
				return value < 10
					? t.raw('strainLevels.high')
					: value < 15
						? t.raw('strainLevels.moderate')
						: t.raw('strainLevels.low');
			case 'perClose':
				return value > 40
					? t.raw('strainLevels.veryHigh')
					: value > 20
						? t.raw('strainLevels.high')
						: value > 5
							? t.raw('strainLevels.moderate')
							: t.raw('strainLevels.low');
			case 'strain':
				return metricsComparison.after?.strainText.toLowerCase() || 'low';
			case 'tiredness':
				return metricsComparison.after?.tiredText.toLowerCase().replace(' ', '-') || 'low';
			default:
				return t.raw('strainLevels.low');
		}
	};

	const getStatusClass = (value: number, type: 'blinkRate' | 'perClose' | 'strainLevel') => {
		if (type === 'blinkRate') {
			if (value <= 10) return styles.poor;
			if (value <= 15) return styles.good;
			if (value <= 20) return styles.moderate;
			return styles.high;
		}
		if (type === 'perClose') {
			if (value <= 20) return styles.good;
			if (value <= 40) return styles.moderate;
			return styles.poor;
		}
		if (type === 'strainLevel') {
			if (value <= 1) return styles.good;
			if (value <= 2) return styles.moderate;
			return styles.poor;
		}
		return styles.good;
	};

	const MetricCard: React.FC<{
		icon: React.ReactNode;
		label: string;
		value: string | number;
		recommendedValue: string;
		status?: string;
	}> = ({ icon, label, value, recommendedValue, status }) => (
		<div className={styles.metricCard}>
			<div className={styles.cardIcon}>{icon}</div>
			<div className={styles.cardContent}>
				<div className={styles.metricHeader}>
					<span className={styles.metricLabel}>{label}</span>
					<span className={styles.recommendedValue}>{recommendedValue}</span>
				</div>
				<div className={styles.metricValue} data-status={status}>
					{value}
				</div>
			</div>
		</div>
	);

	const renderAllMetrics = (metrics: EyeMetrics | null) => {
		if (!metrics) return null;

		const allMetrics = [
			{
				icon: <Eye size={36} />,
				label: eyeMetricsDisplayText.metricLabels.blinkRate,
				value: metrics.blinkRate.toFixed(1),
				recommendedValue: eyeMetricsDisplayText.recommendedValues.blinkRate,
				status: getStatus(metrics.blinkRate, 'blinkRate'),
			},
			{
				icon: <Activity size={36} />,
				label: eyeMetricsDisplayText.metricLabels.eyeClosure,
				value: `${metrics.perClose.toFixed(1)} %`,
				recommendedValue: eyeMetricsDisplayText.recommendedValues.eyeClosure,
				status: getStatus(metrics.perClose, 'perClose'),
			},
			{
				icon: <AlertTriangle size={36} />,
				label: eyeMetricsDisplayText.metricLabels.eyeStrain,
				value: metrics.strainText,
				recommendedValue: eyeMetricsDisplayText.recommendedValues.eyeStrain,
				status: getStatus(0, 'strain'),
			},
			{
				icon: <Battery size={36} />,
				label: eyeMetricsDisplayText.metricLabels.tiredness,
				value: metrics.tiredText,
				recommendedValue: eyeMetricsDisplayText.recommendedValues.tiredness,
				status: getStatus(0, 'tiredness'),
			},
			{
				icon: <Brain size={36} />,
				label: eyeMetricsDisplayText.metricLabels.attentionLevel,
				value: `${(metrics.attentionFrac * 100).toFixed(1)} %`,
				recommendedValue: eyeMetricsDisplayText.recommendedValues.attentionLevel,
				status: metrics.attBinary
					? t.raw('strainLevels.low')
					: t.raw('strainLevels.high'),
			},
			{
				icon: <Target size={36} />,
				label: eyeMetricsDisplayText.metricLabels.eyeAspectRatio,
				value: metrics.eyeAspectRatio.toFixed(3),
				recommendedValue: eyeMetricsDisplayText.recommendedValues.eyeAspectRatio,
			},
			{
				icon: <Activity size={36} />,
				label: eyeMetricsDisplayText.metricLabels.pupilDilation,
				value: metrics.pupilDilation.toFixed(1),
				recommendedValue: eyeMetricsDisplayText.recommendedValues.pupilDilation,
			},
			{
				icon: <Zap size={36} />,
				label: eyeMetricsDisplayText.metricLabels.squintIntensity,
				value: `${metrics.squintIntensity.toFixed(1)} %`,
				recommendedValue: eyeMetricsDisplayText.recommendedValues.squintIntensity,
			},
		];

		return (
			<div className={styles.metricsGrid}>
				{allMetrics.map((metric) => (
					<MetricCard
						key={metric.label}
						icon={metric.icon}
						label={metric.label}
						value={metric.value}
						recommendedValue={metric.recommendedValue}
						status={metric.status}
					/>
				))}
			</div>
		);
	};

	return (
		<Dialog isOpen={isOpen} onClose={handleClose}>
			<div className={styles.modalContainer}>
				{isScanning && (
					<div className={styles.cameraContainer}>
						<CamScreen
							oldVideoRef={contextVideoRef}
							oldCanvasRef={contextCanvasRef}
							loading={loading}
							error={error}
							isActive={isActive}
							cameraReady={cameraReady}
							onToggleTracking={() => {}} 						
						/>
						<div className={styles.metricsOverlay}>
									{currentMetrics && (
										<div className={styles.metricsRow}>
											<div>
												<span className={styles.overlayLabel}>{livePageText.eyeScan.metricLabels.blinkRate}</span>
												<span className={`${styles.overlayValue} ${getStatusClass(currentMetrics.blinkRate, 'blinkRate')}`}>
													{currentMetrics.blinkRate.toFixed(1)} bpm
												</span>
											</div>
											<div>
												<span className={styles.overlayLabel}>{livePageText.eyeScan.metricLabels.eyeClosure}</span>
												<span className={`${styles.overlayValue} ${getStatusClass(currentMetrics.perClose, 'perClose')}`}>
													{currentMetrics.perClose.toFixed(1)}%
												</span>
											</div>
											<div>
												<span className={styles.overlayLabel}>{livePageText.eyeScan.metricLabels.strainLevel}</span>
												<span className={`${styles.overlayValue} ${styles[currentMetrics.strainText.toLowerCase()]}`}>
													{currentMetrics.strainText}
												</span>
											</div>
											<div>
												<span className={styles.overlayLabel}>{livePageText.eyeScan.metricLabels.attention}</span>
												<span className={`${styles.overlayValue} ${currentMetrics.attBinary ? styles.good : styles.poor}`}>
													{currentMetrics.attBinary ? livePageText.eyeScan.attentionStates.good : livePageText.eyeScan.attentionStates.poor}
												</span>
											</div>
										</div>
									)}
						</div>

					<div className={styles.scanControls}>
							<div className={styles.timerDisplay}>
								<span>{countdown}</span>
							</div>
							<button onClick={handleStopScan} className={styles.stopButton}>
								<StopCircle size={20} />
								{livePageText.eyeScan.stopButton}
							</button>
						</div>
					</div>
				)}

				{scanCompleted && (
					<div className={styles.resultsContainer}>
						<div className={styles.resultsHeader}>
							<h2 className={styles.resultsTitle}>{livePageText.eyeScan.completedTitle}</h2>
							<p>{livePageText.eyeScan.completedSubtitle}</p>
						</div>
						<div className={styles.scanResults}>
							{renderAllMetrics(metricsComparison.after)}
						</div>

						<div className={styles.resultsFooter}>
							<button onClick={handleClose} className={styles.closeButton}>
								{livePageText.eyeScan.closeButton}
							</button>
						</div>
					</div>
				)}
			</div>
		</Dialog>
	);
};

export default EyeScanModal;
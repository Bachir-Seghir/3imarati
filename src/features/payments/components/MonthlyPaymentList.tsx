import { PaymentCard } from "./PaymentCard";

export const MonthlyPaymentsList = ({
	unpaid,
	paid,
	canManage,
	onPay,
	onCancel,
}: any) => {
	return (
		<>
			{unpaid.map((p: any) => (
				<PaymentCard
					key={p.id}
					payment={p}
					canManage={canManage}
					onPay={onPay}
					onCancel={onCancel}
				/>
			))}

			{paid.map((p: any) => (
				<PaymentCard
					key={p.id}
					payment={p}
					canManage={canManage}
					onCancel={onCancel}
					onPay={onPay}
				/>
			))}
		</>
	);
};

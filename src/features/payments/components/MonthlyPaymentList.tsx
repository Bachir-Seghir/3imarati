import { PaymentCard } from "./PaymentCard";

export const MonthlyPaymentsList = ({
	unpaid,
	paid,
	canManage,
	onPay,
}: any) => {
	return (
		<>
			{unpaid.map((p: any) => (
				<PaymentCard
					key={p.id}
					payment={p}
					canManage={canManage}
					onPay={onPay}
				/>
			))}

			{paid.map((p: any) => (
				<PaymentCard
					key={p.id}
					payment={p}
					canManage={canManage}
				/>
			))}
		</>
	);
};

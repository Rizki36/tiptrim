import { PrismaClient } from "../app/generated/prisma";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function createOwner(username: string, password: string) {
	const hashedPassword = await hash(password, 10);

	const user = await prisma.user.create({
		data: {
			username,
			password: hashedPassword,
			role: "OWNER",
		},
	});

	console.log(`✅ Owner created successfully: ${username} (ID: ${user.id})`);
	return user;
}

async function createEmployee(
	username: string,
	password: string,
	name: string,
	role: "CASHIER" | "BARBER",
) {
	const hashedPassword = await hash(password, 10);

	const employee = await prisma.employee.create({
		data: {
			name,
			role,
			user: {
				create: {
					username,
					password: hashedPassword,
					role: "EMPLOYEE",
				},
			},
		},
		include: {
			user: true,
		},
	});

	console.log(
		`✅ ${role} created successfully: ${name} (Username: ${username})`,
	);
	return employee;
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	try {
		if (command === "owner") {
			// Usage: pnpm tsx scripts/create-user.ts owner username password
			if (args.length !== 3) {
				console.error(
					"Usage: pnpm tsx scripts/create-user.ts owner <username> <password>",
				);
				process.exit(1);
			}
			await createOwner(args[1], args[2]);
		} else if (command === "employee") {
			// Usage: pnpm tsx scripts/create-user.ts employee username password name role
			if (args.length !== 5) {
				console.error(
					"Usage: pnpm tsx scripts/create-user.ts employee <username> <password> <name> <cashier|barber>",
				);
				process.exit(1);
			}

			const role = args[4].toUpperCase();
			if (role !== "CASHIER" && role !== "BARBER") {
				console.error("Role must be either 'cashier' or 'barber'");
				process.exit(1);
			}

			await createEmployee(
				args[1],
				args[2],
				args[3],
				role as "CASHIER" | "BARBER",
			);
		} else {
			console.error("Command must be either 'owner' or 'employee'");
			process.exit(1);
		}
	} catch (error) {
		console.error("Error creating user:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();

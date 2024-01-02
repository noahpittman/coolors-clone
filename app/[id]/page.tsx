"use client";

import { Button } from "@/components/ui/button";
import { Copy, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

const Home = () => {
	// store the palette in state
	const [palette, setPalette] = useState<any[]>([]);
	// get the palette from the url
	const { id } = useParams();
	// get the router
	const router = useRouter();

	// generate a random hex color, returns a string
	const randomColor = () => {
		const hex = Math.floor(Math.random() * 0xffffff);
		return "#" + hex.toString(16).padEnd(6, "0");
	};

	// create a function to check whether a string is a valid hex color, returns a boolean
	const isValidHex = (hex: string) => {
		if (hex.length != 7) return false;
		if (hex[0] != "#") return false;
		for (let i = 1; i < hex.length; i++) {
			if (
				!(
					(hex[i] >= "0" && hex[i] <= "9") ||
					(hex[i] >= "a" && hex[i] <= "f") ||
					(hex[i] >= "A" && hex[i] <= "F")
				)
			)
				return false;
		}
		return true;
	};

	// create a function to check whether a string is a valid hex color without the #, returns a boolean
	const isValidHexNoHash = (hex: string) => {
		if (hex.length != 6) return false;
		for (let i = 0; i < hex.length; i++) {
			if (
				!(
					(hex[i] >= "0" && hex[i] <= "9") ||
					(hex[i] >= "a" && hex[i] <= "f") ||
					(hex[i] >= "A" && hex[i] <= "F")
				)
			)
				return false;
		}
		return true;
	};

	// create a function to convert a set of hex colors into a url, returns a string
	const hexSetToUrl = (hexes: any) => {
		let url = "";
		hexes.map((hex: any) => {
			url += hex.color.slice(1) + "-";
		});
		url = url.slice(0, -1);
		console.log(url);
		return url;
	};

	// create a function to validate a set of hex colors separated by dashes, returns an array of valid hexes. If input is "new" returns an array of 5 random hexes
	const validateHexSet = (hex: any) => {
		if (hex == "new") {
			let buffer = [
				{ color: randomColor(), locked: false, index: 0 },
				{ color: randomColor(), locked: false, index: 1 },
				{ color: randomColor(), locked: false, index: 2 },
				{ color: randomColor(), locked: false, index: 3 },
				{ color: randomColor(), locked: false, index: 4 },
			];

			router.replace(hexSetToUrl(buffer));

			return buffer;
		}

		const hexes = hex.split("-");
		// console.log(hexes);

		let buffer: any[] = [];
		let bufferCounter: number = 0;

		console.log("buffercounter", bufferCounter);

		hexes.map((hex: any) => {
			if (hex.length !== 6) {
				// console.log(`Hex must be 6 characters long`);
				return null;
			}
			if (isValidHexNoHash(hex) == false) {
				// console.log(`Hex '${hex}' is invalid`);
				return null;
			}
			if (isValidHexNoHash(hex) == true) {
				// console.log(`Hex '${hex}' is valid`);
				hex = "#" + hex;
				buffer.push({ color: hex, locked: false, index: bufferCounter });
				bufferCounter++;
			}
		});
		// console.log("buffer", buffer);
		return buffer;
	};

	// add event listener to randomizeButton to allow for spacebar to randomize
	const keyDownHandler = (event: { keyCode: any }) => {
		if (event.keyCode == "32") {
			document.getElementById("randomizeButton")?.click();
		}
	};

	// change the color of the palette
	const changePalette = () => {
		const newPalette = palette.map((color) => {
			if (color.locked) return color;
			return { color: randomColor(), locked: false, index: color.index };
		});
		setPalette(newPalette);
	};

	// add a new color to the palette
	const addColor = () => {
		const newPalette = palette.map((color) => {
			return { color: color.color, locked: false, index: color.index };
		});
		newPalette.push({
			color: randomColor(),
			locked: false,
			index: newPalette.length,
		});
		setPalette(newPalette);
	};

	// remove a color from the palette
	const removeColor = (index: number) => {
		if (palette.length == 1) {
			toast.error("You can't remove the last color!");
			return;
		}
		const newPalette = palette.filter((color) => color.index != index);
		setPalette(newPalette);
	};

	// handle the lock/unlock for colors
	const handleLock = (hex: string) => {
		const newPalette = palette.map((color) => {
			if (color.color == hex) {
				return {
					color: color.color,
					locked: !color.locked,
					index: color.index,
				};
			}
			return color;
		});
		setPalette(newPalette);
	};

	// TODO: change color of text based on background color
	// create a function to determine whether a color is light or dark, returns a boolean
	const isLight = (color: string) => {
		const hex = color.slice(1);
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		if (luma < 128) return false;
		return true;
	};

	// validate the palette on page load and when the url changes
	useEffect(() => {
		setPalette(validateHexSet(id));

		// add event listener to randomizeButton
		document.addEventListener("keydown", keyDownHandler);
		return () => {
			document.removeEventListener("keydown", keyDownHandler);
		};
	}, []);

	useEffect(() => {
		// @ts-ignore
		router.replace(hexSetToUrl(palette));
	}, [palette]);

	return (
		<div className="grid grid-rows-[auto_auto_1fr] min-h-screen grid-flow-row">
			<div className="h-16 row px-4 flex gap-4 items-center border-b shadow-sm"></div>
			<div className="h-16 row px-4 flex gap-4 items-center border-b shadow-sm">
				<Button id="randomizeButton" onClick={changePalette}>
					randomize!
				</Button>
				<Button onKeyUpCapture={() => {}} onClick={addColor}>
					add a color
					<Plus />
				</Button>
			</div>
			<div className="grid grid-flow-col">
				{palette.map((color) => (
					<div
						key={color.index}
						className={`flex justify-center flex-col space-y-8 items-center ${
							isLight(color.color) ? "text-black/75" : "text-white/75"
						}`}
						style={{ background: color.color }}
					>
						<Button
							asChild
							onClick={() => handleLock(color.color)}
							variant={"ghost"}
							size={"icon"}
							className="rounded-full overflow-visible"
						>
							{color.locked == true ? (
								<Lock className="h-10 w-10 p-2 cursor-pointer" />
							) : (
								<Unlock className="h-10 w-10 p-2 cursor-pointer" />
							)}
						</Button>
						<Button
							asChild
							className="rounded-full overflow-visible"
							onClick={() => {
								navigator.clipboard.writeText(color.color);
								toast.success("Copied to clipboard!");
							}}
							variant={"ghost"}
							size={"icon"}
						>
							<Copy className="h-10 w-10 p-2 cursor-pointer" />
						</Button>
						<Button
							asChild
							className="rounded-full overflow-visible"
							variant={"ghost"}
							size={"icon"}
							onClick={() => removeColor(color.index)}
						>
							<Trash2 className="h-10 w-10 p-2 cursor-pointer" />
						</Button>

						<h1 className="text-3xl font-semibold uppercase">
							{color.color.split("").filter((letter: string) => letter != "#")}
						</h1>
					</div>
				))}
			</div>
		</div>
	);
};

export default Home;

// Create a function which takes in a string, and returns a boolean based on whether that string follows a certain format. The format is as follows: The string must consist of ONLY valid hexadecimal characters (0-9, a-f, A-F) The string must be broken into sections of six characters followed by a "-", unless there are only six characters, where no dash is needed. No dash is needed at the end of the final six characters.
// Examples: "000000" ➞ true, "0000-0000" ➞ false, "000000-FFFFFF" ➞ true, "00000000" ➞ false, "00-0000-00" ➞ false

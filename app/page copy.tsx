"use client";

import { Button } from "@/components/ui/button";
import { Copy, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useSearchParams } from "next/navigation";

const Home = () => {
	// store the palette in state
	const [palette, setPalette] = useState<any[]>([]);
	const params = useParams();

	// generate a random palette on first render
	useEffect(() => {
		setPalette([
			{ color: randomColor(), locked: false, index: 0 },
			{ color: randomColor(), locked: false, index: 1 },
			{ color: randomColor(), locked: false, index: 2 },
			{ color: randomColor(), locked: false, index: 3 },
		]);
	}, []);

	// add event listener to randomizeButton to allow for spacebar to randomize
	const keyDownHandler = (event: { keyCode: any }) => {
		if (event.keyCode == "32") {
			document.getElementById("randomizeButton")?.click();
		}
	};
	useEffect(() => {
		// add event listener to randomizeButton
		document.addEventListener("keydown", keyDownHandler);
		return () => {
			document.removeEventListener("keydown", keyDownHandler);
		};
	}, []);

	// generate a random hex color
	const randomColor = () => {
		const hex = Math.floor(Math.random() * 0xffffff);
		return "#" + hex.toString(16).padEnd(6, "0");
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

	// TODO: add a button to copy the entire palette to clipboard
	// TODO: add a button to lock/unlock all colors
	// TODO: add a button to save the palette to a database
	// TODO: change color of text based on background color

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
						className={`flex justify-center flex-col space-y-8 items-center`}
						style={{ background: color.color }}
					>
						<Button className="rounded-full uppercase w-[10ch]">
							{color.color}
						</Button>

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
					</div>
				))}
			</div>
		</div>
	);
};

export default Home;
